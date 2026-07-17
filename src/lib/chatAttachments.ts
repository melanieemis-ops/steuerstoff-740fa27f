// Client-Helfer für Chat-Anhänge (Kamera, Foto, Datei).
// Wichtig: Limits mit src/routes/api/chat.ts synchron halten.

export const MAX_ATTACHMENTS = 4;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const DOC_ACCEPT =
  ".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const DOC_EXT = new Set(["pdf", "txt", "csv", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

export type ChatAttachment = {
  id: string;
  file: File;
  name: string;
  size: number;
  mime: string;
  kind: "image" | "file";
  previewUrl?: string;
};

export type PersistedAttachment = {
  id: string;
  name: string;
  size: number;
  mime: string;
  kind: "image" | "file";
};

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function classifyFile(f: File): "image" | "file" | null {
  const mime = (f.type || "").toLowerCase();
  const ext = extOf(f.name);
  if (mime.startsWith("image/") && IMAGE_EXT.has(ext)) return "image";
  if (IMAGE_EXT.has(ext)) return "image";
  if (DOC_EXT.has(ext)) return "file";
  return null;
}

export type ValidationResult =
  | { ok: true; attachments: ChatAttachment[] }
  | { ok: false; error: string; attachments: ChatAttachment[] };

export function validateAndBuild(
  existing: ChatAttachment[],
  incoming: File[],
): ValidationResult {
  const accepted: ChatAttachment[] = [...existing];
  let totalBytes = existing.reduce((s, a) => s + a.size, 0);

  for (const f of incoming) {
    if (accepted.length >= MAX_ATTACHMENTS) {
      return {
        ok: false,
        error: `Maximal ${MAX_ATTACHMENTS} Anhänge pro Nachricht.`,
        attachments: accepted,
      };
    }
    if (f.size === 0) {
      return { ok: false, error: `Die Datei "${f.name}" ist leer.`, attachments: accepted };
    }
    if (f.size > MAX_FILE_BYTES) {
      return {
        ok: false,
        error: `Die Datei "${f.name}" ist größer als 8 MB.`,
        attachments: accepted,
      };
    }
    if (totalBytes + f.size > MAX_TOTAL_BYTES) {
      return {
        ok: false,
        error: "Anhänge dürfen zusammen höchstens 20 MB umfassen.",
        attachments: accepted,
      };
    }
    const kind = classifyFile(f);
    if (!kind) {
      return {
        ok: false,
        error: `Nicht unterstützter Dateityp: "${f.name}".`,
        attachments: accepted,
      };
    }
    const previewUrl =
      kind === "image" && typeof URL !== "undefined" ? URL.createObjectURL(f) : undefined;
    accepted.push({
      id: uid(),
      file: f,
      name: f.name,
      size: f.size,
      mime: f.type || "",
      kind,
      previewUrl,
    });
    totalBytes += f.size;
  }
  return { ok: true, attachments: accepted };
}

export function revokeAttachment(a: ChatAttachment | undefined) {
  if (a?.previewUrl) {
    try {
      URL.revokeObjectURL(a.previewUrl);
    } catch {
      /* noop */
    }
  }
}

export function revokeAll(list: ChatAttachment[]) {
  for (const a of list) revokeAttachment(a);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function toPersisted(list: ChatAttachment[]): PersistedAttachment[] {
  return list.map((a) => ({
    id: a.id,
    name: a.name,
    size: a.size,
    mime: a.mime,
    kind: a.kind,
  }));
}
