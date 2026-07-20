import type { ClipboardEvent as ReactClipboardEvent, DragEvent as ReactDragEvent } from "react";
import {
  ALL_ATTACHMENT_ACCEPT,
  ATTACHMENT_PRIVACY_URL,
  type AttachmentKind,
  IMAGE_ACCEPT,
} from "@/lib/attachment-types";

export function createAttachmentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}

export function sanitizeAttachmentName(name: string) {
  const cleaned = Array.from(name)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "Anhang";
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function getAttachmentIconLabel(kind: AttachmentKind) {
  switch (kind) {
    case "image":
      return "Bilddatei";
    case "pdf":
      return "PDF-Dokument";
    case "text":
      return "Textdatei";
    case "spreadsheet":
      return "Tabellendatei";
    default:
      return "Dokument";
  }
}

export function isImageKind(kind: AttachmentKind) {
  return kind === "image";
}

export function isDesktopLike() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
}

export function getUploadWarningUrl() {
  return ATTACHMENT_PRIVACY_URL;
}

export function getPickerAcceptValue(action: "camera" | "image" | "file") {
  if (action === "camera" || action === "image") return IMAGE_ACCEPT;
  return ALL_ATTACHMENT_ACCEPT;
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const src = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
      element.src = src;
    });
    return image;
  } finally {
    URL.revokeObjectURL(src);
  }
}

function getResizedDimensions(width: number, height: number, maxDimension = 2200) {
  if (Math.max(width, height) <= maxDimension) return { width, height };
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  const originalType =
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";
  const quality = originalType === "image/png" ? undefined : 0.88;

  let width = 0;
  let height = 0;
  let drawSource: CanvasImageSource;

  try {
    const bitmap = await loadBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    drawSource = bitmap;
  } catch {
    const image = await loadImageElement(file);
    width = image.naturalWidth || image.width;
    height = image.naturalHeight || image.height;
    drawSource = image;
  }

  const nextSize = getResizedDimensions(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = nextSize.width;
  canvas.height = nextSize.height;
  const context = canvas.getContext("2d", { alpha: originalType === "image/png" });
  if (!context) throw new Error("Bild konnte nicht vorbereitet werden.");
  context.drawImage(drawSource, 0, 0, nextSize.width, nextSize.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) resolve(value);
        else reject(new Error("Bild konnte nicht vorbereitet werden."));
      },
      originalType,
      quality,
    );
  });

  const preparedName =
    sanitizeAttachmentName(file.name).replace(/\.[^.]+$/, "") +
    file.name.slice(file.name.lastIndexOf("."));
  return new File([blob], preparedName, {
    type: blob.type || originalType,
    lastModified: Date.now(),
  });
}

export function getClipboardFiles(
  event: ClipboardEvent | ReactClipboardEvent<HTMLTextAreaElement>,
) {
  const items = Array.from(event.clipboardData?.items ?? []);
  return items
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export function isFileDrag(event: DragEvent | ReactDragEvent<HTMLElement>) {
  const types = Array.from(event.dataTransfer?.types ?? []);
  return types.includes("Files");
}
