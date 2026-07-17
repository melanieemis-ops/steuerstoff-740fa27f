/**
 * useChatAttachments.ts
 * 
 * React hook for managing file attachments in the chat.
 * Handles validation, upload state, preview cleanup, and error management.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ChatAttachment,
  type AttachmentKind,
  DEFAULT_UPLOAD_CONFIG,
} from "@/lib/attachment-types";
import {
  validateFile,
  validateFileBatch,
  formatFileSize,
} from "@/lib/attachment-validation";
import {
  processImageFile,
  createPreviewUrl,
  revokePreviewUrl,
} from "@/lib/attachment-utils";

/**
 * Hook for managing chat attachments.
 */
export function useChatAttachments() {
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  /**
   * Add files to attachments.
   * Validates, processes images, and sets initial upload state.
   */
  const addFiles = useCallback(
    async (files: File[]): Promise<{ success: boolean; error?: string }> => {
      const validation = validateFileBatch(files, DEFAULT_UPLOAD_CONFIG);

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const newAttachments: ChatAttachment[] = [];

      for (const { file, kind } of validation.validatedFiles!) {
        const id = Math.random().toString(36).slice(2, 10);
        let processedFile = file;
        let previewUrl: string | null = null;

        // Process images: remove EXIF, resize, optimize
        if (kind === "image") {
          try {
            const processed = await processImageFile(file);
            processedFile = new File([processed], file.name, {
              type: file.type,
            });
          } catch {
            // Fall back to original file
          }

          previewUrl = createPreviewUrl(processedFile);
          if (previewUrl) {
            previewUrlsRef.current.add(previewUrl);
          }
        }

        newAttachments.push({
          id,
          file: processedFile,
          name: file.name,
          mimeType: file.type,
          size: processedFile.size,
          kind,
          previewUrl,
          uploadStatus: "selected",
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);

      return { success: true };
    },
    []
  );

  /**
   * Remove a single attachment by ID.
   */
  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        revokePreviewUrl(attachment.previewUrl);
        previewUrlsRef.current.delete(attachment.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  /**
   * Remove all attachments.
   */
  const removeAllAttachments = useCallback(() => {
    for (const url of previewUrlsRef.current) {
      revokePreviewUrl(url);
    }
    previewUrlsRef.current.clear();
    setAttachments([]);
  }, []);

  /**
   * Update upload status for an attachment.
   */
  const updateStatus = useCallback(
    (id: string, uploadStatus: string, error?: string) => {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                uploadStatus: uploadStatus as any,
                error,
              }
            : a
        )
      );
    },
    []
  );

  /**
   * Update progress for an attachment.
   */
  const updateProgress = useCallback((id: string, progress: number) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, progress } : a))
    );
  }, []);

  /**
   * Mark an attachment as ready with server-assigned ID.
   */
  const markReady = useCallback((id: string, uploadedFileId: string) => {
    setAttachments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              uploadStatus: "ready" as const,
              uploadedFileId,
              // Clear the original File to save memory
              file: new File([], "cleared"),
            }
          : a
      )
    );
  }, []);

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current) {
        revokePreviewUrl(url);
      }
      previewUrlsRef.current.clear();
    };
  }, []);

  return {
    attachments,
    addFiles,
    removeAttachment,
    removeAllAttachments,
    updateStatus,
    updateProgress,
    markReady,
  };
}
