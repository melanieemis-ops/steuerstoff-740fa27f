import { createFileRoute } from "@tanstack/react-router";
import { validateAttachmentFile } from "@/lib/attachment-validation";
import { saveUpload } from "@/lib/upload-store";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.includes("multipart/form-data")) {
          return json(400, { error: "Ungültiges Anfrageformat." });
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return json(400, { error: "Datei konnte nicht gelesen werden." });
        }

        const file = formData.get("file");
        if (!(file instanceof File)) {
          return json(400, { error: "Keine Datei erhalten." });
        }

        const validation = validateAttachmentFile(file);
        if (!validation.ok) {
          return json(validation.error.includes("15 MB") ? 413 : 415, { error: validation.error });
        }

        const bytes = new Uint8Array(await file.arrayBuffer());
        const record = saveUpload({
          name: validation.name,
          mimeType: validation.mimeType,
          size: bytes.byteLength,
          kind: validation.kind,
          bytes,
        });

        return json(201, {
          uploadedFileId: record.id,
          downloadUrl: `/api/upload/${record.id}`,
          expiresAt: new Date(record.expiresAt).toISOString(),
        });
      },
    },
  },
});
