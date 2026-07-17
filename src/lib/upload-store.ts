import { UPLOAD_TTL_MS, type AttachmentKind } from "@/lib/attachment-types";

type StoredUploadRecord = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  bytes: Uint8Array;
  createdAt: number;
  expiresAt: number;
};

declare global {
  var __steuerstoffUploadStore: Map<string, StoredUploadRecord> | undefined;
}

// Test-only temporary storage: uploads live only in the current server process,
// are lost on restart, and expire automatically after the configured TTL.
const store = globalThis.__steuerstoffUploadStore ?? new Map<string, StoredUploadRecord>();
globalThis.__steuerstoffUploadStore = store;

function cleanupExpired() {
  const now = Date.now();
  for (const [id, value] of store.entries()) {
    if (value.expiresAt <= now) store.delete(id);
  }
}

export function saveUpload(input: Omit<StoredUploadRecord, "id" | "createdAt" | "expiresAt">) {
  cleanupExpired();
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const record: StoredUploadRecord = {
    ...input,
    id,
    createdAt,
    expiresAt: createdAt + UPLOAD_TTL_MS,
  };
  store.set(id, record);
  return record;
}

export function readUpload(uploadId: string) {
  cleanupExpired();
  return store.get(uploadId) ?? null;
}
