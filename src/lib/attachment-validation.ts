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
