/**
 * upload-files.ts
 * 
 * In-memory file storage for testing.
 * Stores uploaded files temporarily and assigns unique IDs.
 * WARNING: This is test-only and NOT suitable for production.
 */

import { v4 as uuidv4 } from "crypto";

interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  uploadedAt: number;
  expiresAt: number;
}

// In-memory storage (clears on server restart)
const fileStorage = new Map<string, StoredFile>();

// File retention: 30 minutes for testing
const RETENTION_MS = 30 * 60 * 1000;

// Max total storage: 500 MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024;

/**
 * Store an uploaded file in memory.
 * Returns the file ID for later reference.
 */
export function storeUploadedFile(
  name: string,
  mimeType: string,
  buffer: Buffer
): { fileId: string; error?: string } {
  // Validate inputs
  if (!name || !mimeType || !buffer) {
    return { fileId: "", error: "Invalid file data" };
  }

  // Check total size
  let totalSize = buffer.byteLength;
  for (const file of fileStorage.values()) {
    totalSize += file.size;
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    return { fileId: "", error: "Storage quota exceeded" };
  }

  const fileId = uuidv4();
  const now = Date.now();

  fileStorage.set(fileId, {
    id: fileId,
    name,
    mimeType,
    size: buffer.byteLength,
    buffer,
    uploadedAt: now,
    expiresAt: now + RETENTION_MS,
  });

  return { fileId };
}

/**
 * Retrieve a stored file by ID.
 */
export function getStoredFile(fileId: string): StoredFile | null {
  const file = fileStorage.get(fileId);

  if (!file) {
    return null;
  }

  // Check expiration
  if (Date.now() > file.expiresAt) {
    fileStorage.delete(fileId);
    return null;
  }

  return file;
}

/**
 * Clean up expired files.
 * Should be called periodically.
 */
export function cleanupExpiredFiles(): number {
  const now = Date.now();
  let removed = 0;

  for (const [id, file] of fileStorage.entries()) {
    if (now > file.expiresAt) {
      fileStorage.delete(id);
      removed++;
    }
  }

  return removed;
}

/**
 * Delete a specific file.
 */
export function deleteStoredFile(fileId: string): boolean {
  return fileStorage.delete(fileId);
}

/**
 * Get storage stats for monitoring.
 */
export function getStorageStats() {
  let totalSize = 0;
  let fileCount = 0;
  const now = Date.now();

  for (const file of fileStorage.values()) {
    if (now <= file.expiresAt) {
      totalSize += file.size;
      fileCount++;
    }
  }

  return {
    fileCount,
    totalSize,
    maxTotalSize: MAX_TOTAL_SIZE,
    retentionMs: RETENTION_MS,
  };
}
