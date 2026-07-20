export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 40 * 1024 * 1024;
export const UPLOAD_TTL_MS = 60 * 60 * 1000;
export const UPLOAD_WARNING_STORAGE_KEY = "steuerstoff-upload-warning-v1";
export const ATTACHMENT_PRIVACY_URL = "/steuerstoff-datenschutzerklaerung.pdf";

export type AttachmentKind = "image" | "pdf" | "text" | "spreadsheet" | "document";

export type AttachmentUploadStatus = "selected" | "preparing" | "uploading" | "ready" | "error";

export type ChatMessageAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  uploadedFileId: string;
  downloadUrl: string;
  expiresAt: string;
};

export type ChatAttachment = {
  id: string;
  file: File;
  preparedFile?: File;
  name: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  previewUrl?: string;
  uploadStatus: AttachmentUploadStatus;
  progress?: number;
  uploadedFileId?: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
};

export type AttachmentPickerAction = "camera" | "image" | "file";

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;
export const DOCUMENT_EXTENSIONS = ["pdf", "txt", "csv", "doc", "docx", "xls", "xlsx"] as const;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
export const DOCUMENT_ACCEPT =
  ".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const ALL_ATTACHMENT_ACCEPT = `${IMAGE_ACCEPT},${DOCUMENT_ACCEPT}`;
