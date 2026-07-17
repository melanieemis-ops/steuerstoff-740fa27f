import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import type { ChatAttachment } from "@/lib/attachment-types";
import {
  validateAttachmentCount,
  validateAttachmentFile,
  validateAttachmentTotalSize,
} from "@/lib/attachment-validation";
import {
  createAttachmentId,
  getClipboardFiles,
  isFileDrag,
  prepareImageForUpload,
} from "@/lib/attachment-utils";
import { useFileUpload } from "@/hooks/useFileUpload";

export function useChatAttachments() {
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const uploadFile = useFileUpload();

  const revokePreview = useCallback((previewUrl?: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, []);

  useEffect(() => {
    return () => {
      for (const attachment of attachments) revokePreview(attachment.previewUrl);
    };
  }, [attachments, revokePreview]);

  const updateAttachment = useCallback(
    (id: string, updater: (current: ChatAttachment) => ChatAttachment) => {
      setAttachments((current) =>
        current.map((attachment) => (attachment.id === id ? updater(attachment) : attachment)),
      );
    },
    [],
  );

  const removeAttachment = useCallback(
    (id: string) => {
      setAttachments((current) => {
        const target = current.find((attachment) => attachment.id === id);
        revokePreview(target?.previewUrl);
        return current.filter((attachment) => attachment.id !== id);
      });
    },
    [revokePreview],
  );

  const clearAttachments = useCallback(() => {
    setAttachments((current) => {
      for (const attachment of current) revokePreview(attachment.previewUrl);
      return [];
    });
    setNotice(null);
  }, [revokePreview]);

  const uploadAttachment = useCallback(
    async (id: string, sourceFile: File) => {
      updateAttachment(id, (current) => ({
        ...current,
        uploadStatus: "preparing",
        progress: 5,
        error: undefined,
      }));

      try {
        const validated = validateAttachmentFile(sourceFile);
        if (!validated.ok) {
          throw new Error(validated.error);
        }

        const preparedFile =
          validated.kind === "image" ? await prepareImageForUpload(sourceFile) : sourceFile;
        const nextValidation = validateAttachmentFile({
          name: preparedFile.name,
          size: preparedFile.size,
          type: preparedFile.type,
        });
        if (!nextValidation.ok) {
          throw new Error(nextValidation.error);
        }

        const previewUrl =
          nextValidation.kind === "image" ? URL.createObjectURL(preparedFile) : undefined;
        updateAttachment(id, (current) => {
          revokePreview(current.previewUrl);
          return {
            ...current,
            name: nextValidation.name,
            mimeType: nextValidation.mimeType,
            size: preparedFile.size,
            kind: nextValidation.kind,
            preparedFile,
            previewUrl,
            uploadStatus: "uploading",
            progress: 15,
            error: undefined,
          };
        });

        const result = await uploadFile(preparedFile, (progress) => {
          updateAttachment(id, (current) => ({
            ...current,
            uploadStatus: "uploading",
            progress,
          }));
        });

        updateAttachment(id, (current) => ({
          ...current,
          uploadStatus: "ready",
          progress: 100,
          uploadedFileId: result.uploadedFileId,
          downloadUrl: result.downloadUrl,
          expiresAt: result.expiresAt,
          error: undefined,
        }));
      } catch (error) {
        updateAttachment(id, (current) => ({
          ...current,
          uploadStatus: "error",
          progress: undefined,
          error: error instanceof Error ? error.message : "Upload fehlgeschlagen.",
        }));
      }
    },
    [revokePreview, updateAttachment, uploadFile],
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const selectedFiles = Array.from(fileList ?? []);
      if (selectedFiles.length === 0) return false;

      const countError = validateAttachmentCount(attachments.length, selectedFiles.length);
      if (countError) {
        setNotice(countError);
        return false;
      }

      let runningTotal = attachments.reduce((sum, attachment) => sum + attachment.size, 0);
      const acceptedFiles: Array<{
        id: string;
        file: File;
        validation: ReturnType<typeof validateAttachmentFile> & { ok: true };
      }> = [];
      const errors: string[] = [];

      for (const file of selectedFiles) {
        const validation = validateAttachmentFile(file);
        if (!validation.ok) {
          errors.push(validation.error);
          continue;
        }

        const totalError = validateAttachmentTotalSize(runningTotal + file.size);
        if (totalError) {
          errors.push(totalError);
          continue;
        }

        runningTotal += file.size;
        acceptedFiles.push({ id: createAttachmentId(), file, validation });
      }

      if (acceptedFiles.length === 0) {
        setNotice(errors[0] ?? "Keine Datei konnte hinzugefügt werden.");
        return false;
      }

      setNotice(errors[0] ?? null);
      setAttachments((current) => [
        ...current,
        ...acceptedFiles.map(({ id, file, validation }) => ({
          id,
          file,
          name: validation.name,
          mimeType: validation.mimeType,
          size: file.size,
          kind: validation.kind,
          uploadStatus: "selected" as const,
          progress: 0,
        })),
      ]);

      await Promise.all(acceptedFiles.map(({ id, file }) => uploadAttachment(id, file)));
      return true;
    },
    [attachments, uploadAttachment],
  );

  const retryAttachment = useCallback(
    async (id: string) => {
      const target = attachments.find((attachment) => attachment.id === id);
      if (!target) return;
      await uploadAttachment(id, target.file);
    },
    [attachments, uploadAttachment],
  );

  const handlePaste = useCallback(
    async (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const files = getClipboardFiles(event);
      if (files.length === 0) return;
      event.preventDefault();
      await addFiles(files);
    },
    [addFiles],
  );

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragActive(true);
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragActive(false);
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent<HTMLElement>) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setDragActive(false);
      await addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const readyAttachments = useMemo(
    () =>
      attachments
        .filter(
          (
            attachment,
          ): attachment is ChatAttachment &
            Required<Pick<ChatAttachment, "uploadedFileId" | "downloadUrl" | "expiresAt">> =>
            attachment.uploadStatus === "ready" &&
            Boolean(attachment.uploadedFileId) &&
            Boolean(attachment.downloadUrl) &&
            Boolean(attachment.expiresAt),
        )
        .map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
          kind: attachment.kind,
          uploadedFileId: attachment.uploadedFileId,
          downloadUrl: attachment.downloadUrl,
          expiresAt: attachment.expiresAt,
        })),
    [attachments],
  );

  const hasPendingUploads = attachments.some(
    (attachment) =>
      attachment.uploadStatus === "preparing" ||
      attachment.uploadStatus === "uploading" ||
      attachment.uploadStatus === "selected",
  );
  const hasUploadErrors = attachments.some((attachment) => attachment.uploadStatus === "error");

  return {
    attachments,
    readyAttachments,
    notice,
    dragActive,
    hasPendingUploads,
    hasUploadErrors,
    addFiles,
    retryAttachment,
    removeAttachment,
    clearAttachments,
    handlePaste,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    setNotice,
  };
}
