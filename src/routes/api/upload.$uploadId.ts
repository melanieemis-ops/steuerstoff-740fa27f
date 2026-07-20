import { createFileRoute } from "@tanstack/react-router";
import { readUpload } from "@/lib/upload-store";

function contentDisposition(name: string, inline: boolean) {
  const type = inline ? "inline" : "attachment";
  return `${type}; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export const Route = createFileRoute("/api/upload/$uploadId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const record = readUpload(params.uploadId);
        if (!record) {
          return new Response("Dateireferenz ist abgelaufen oder nicht mehr verfügbar.", {
            status: 410,
            headers: { "cache-control": "no-store" },
          });
        }

        const inline = new URL(request.url).searchParams.get("download") !== "1";
        return new Response(record.bytes, {
          status: 200,
          headers: {
            "content-type": record.mimeType,
            "content-length": String(record.bytes.byteLength),
            "cache-control": "no-store",
            "content-disposition": contentDisposition(record.name, inline),
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
