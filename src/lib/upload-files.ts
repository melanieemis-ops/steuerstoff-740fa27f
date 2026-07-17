export type UploadFileResult = {
  uploadedFileId: string;
  downloadUrl: string;
  expiresAt: string;
};

export function uploadFileWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadFileResult> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.max(5, Math.min(99, Math.round((event.loaded / event.total) * 100))));
    };
    request.onerror = () => reject(new Error("Netzwerkfehler beim Upload."));
    request.onabort = () => reject(new Error("Upload wurde abgebrochen."));
    request.onload = () => {
      const response = request.response as {
        uploadedFileId?: string;
        downloadUrl?: string;
        expiresAt?: string;
        error?: string;
      } | null;
      if (
        request.status < 200 ||
        request.status >= 300 ||
        !response?.uploadedFileId ||
        !response.downloadUrl ||
        !response.expiresAt
      ) {
        reject(new Error(response?.error || "Upload fehlgeschlagen."));
        return;
      }
      onProgress?.(100);
      resolve({
        uploadedFileId: response.uploadedFileId,
        downloadUrl: response.downloadUrl,
        expiresAt: response.expiresAt,
      });
    };

    const formData = new FormData();
    formData.append("file", file, file.name);
    request.send(formData);
  });
}
