import {
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_TOTAL_SIZE,
  type AttachmentKind,
} from "@/lib/attachment-types";
import { sanitizeAttachmentName } from "@/lib/attachment-utils";

type AttachmentTypeRule = {
  kind: AttachmentKind;
  extensions: string[];
  mimeTypes: string[];
};

const TYPE_RULES: AttachmentTypeRule[] = [
  {
    kind: "image",
    extensions: ["jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  {
    kind: "pdf",
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
  },
  {
    kind: "text",
    extensions: ["txt", "csv"],
    mimeTypes: ["text/plain", "text/csv", "application/csv", "application/vnd.ms-excel"],
  },
  {
    kind: "document",
    extensions: ["doc", "docx"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  {
    kind: "spreadsheet",
    extensions: ["xls", "xlsx"],
    mimeTypes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
];

export type AttachmentValidationSuccess = {
  ok: true;
  name: string;
  mimeType: string;
  kind: AttachmentKind;
};

export type AttachmentValidationFailure = {
  ok: false;
  error: string;
};

export type AttachmentValidationResult = AttachmentValidationSuccess | AttachmentValidationFailure;

function getExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

function normalizeMimeType(mimeType: string) {
  return mimeType.trim().toLowerCase();
}

export function getAttachmentRule(name: string, mimeType: string) {
  const extension = getExtension(name);
  const normalizedMimeType = normalizeMimeType(mimeType);

  return TYPE_RULES.find((rule) => {
    const extensionMatch = rule.extensions.includes(extension);
    const mimeMatch = normalizedMimeType ? rule.mimeTypes.includes(normalizedMimeType) : false;

    // Manche mobile Browser liefern für Office-Dateien oder Kamera-Exporte nur
    // application/octet-stream zurück. In diesem Fall erlauben wir ausschließlich
    // unsere enge Whitelist per Dateiendung und prüfen zusätzlich Größe und Limits.
    if (!normalizedMimeType || normalizedMimeType === "application/octet-stream") {
      return extensionMatch;
    }

    return mimeMatch || extensionMatch;
  });
}

export function validateAttachmentFile(
  file: Pick<File, "name" | "size" | "type">,
): AttachmentValidationResult {
  const safeName = sanitizeAttachmentName(file.name);
  if (file.size <= 0) {
    return { ok: false, error: `„${safeName}“ ist leer und kann nicht hochgeladen werden.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Die Datei ist größer als 15 MB." };
  }

  const rule = getAttachmentRule(safeName, file.type);
  if (!rule) {
    return { ok: false, error: "Dieses Dateiformat wird derzeit noch nicht unterstützt." };
  }

  const mimeType =
    normalizeMimeType(file.type) || fallbackMimeType(rule.kind, getExtension(safeName));
  return { ok: true, name: safeName, mimeType, kind: rule.kind };
}

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function isProbablyText(bytes: Uint8Array) {
  const sample = bytes.slice(0, Math.min(bytes.length, 2048));
  if (sample.length === 0) return false;
  let printable = 0;
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 128) {
      printable += 1;
    }
  }
  return printable / sample.length > 0.9;
}

function matchesExpectedContent(extension: string, kind: AttachmentKind, bytes: Uint8Array) {
  if (kind === "image") {
    if (extension === "png") return startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47]);
    if (extension === "webp") {
      return (
        startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    }
    return startsWithBytes(bytes, [0xff, 0xd8, 0xff]);
  }

  if (kind === "pdf") {
    return startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46]);
  }

  if (kind === "document" || kind === "spreadsheet") {
    if (extension === "docx" || extension === "xlsx") {
      return startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]);
    }
    if (extension === "doc" || extension === "xls") {
      return startsWithBytes(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    }
  }

  if (kind === "text") {
    return isProbablyText(bytes);
  }

  return false;
}

export function validateAttachmentBytes(
  file: Pick<File, "name" | "size" | "type">,
  bytes: Uint8Array,
): AttachmentValidationResult {
  const validation = validateAttachmentFile(file);
  if (!validation.ok) return validation;

  const extension = getExtension(validation.name);
  if (!matchesExpectedContent(extension, validation.kind, bytes)) {
    return {
      ok: false,
      error: "Dateiinhalt passt nicht zum erwarteten Dateiformat.",
    };
  }

  return validation;
}

function fallbackMimeType(kind: AttachmentKind, extension: string) {
  if (kind === "image")
    return extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
  if (kind === "pdf") return "application/pdf";
  if (kind === "text") return extension === "csv" ? "text/csv" : "text/plain";
  if (kind === "spreadsheet")
    return extension === "xls"
      ? "application/vnd.ms-excel"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return extension === "doc"
    ? "application/msword"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export function validateAttachmentCount(existingCount: number, incomingCount: number) {
  if (existingCount + incomingCount > MAX_FILES) {
    return "Du kannst höchstens 5 Dateien gleichzeitig senden.";
  }
  return null;
}

export function validateAttachmentTotalSize(totalSize: number) {
  if (totalSize > MAX_TOTAL_SIZE) {
    return "Die Anhänge sind zusammen größer als 40 MB.";
  }
  return null;
}
