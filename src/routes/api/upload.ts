// Upload-API für Test-Dateien
// POST /api/upload
// Speichert Dateien temporär im Memory für Testing
// WARNING: Nur für anonymisierte Test-Daten, nicht für Produktionsdaten!

import { createFileRoute } from "@tanstack/react-router";
import { storeUploadedFile, cleanupExpiredFiles } from "@/lib/upload-files";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Clean up expired files periodically
          cleanupExpiredFiles();

          // Parse FormData
          const formData = await request.formData();
          const file = formData.get("file");

          if (!file || !(file instanceof File)) {
            return new Response(
              JSON.stringify({ error: "No file provided" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          // Validate file size
          const maxFileSize = 15 * 1024 * 1024; // 15 MB
          if (file.size > maxFileSize) {
            return new Response(
              JSON.stringify({
                error: "File too large",
                maxSize: maxFileSize,
              }),
              { status: 413, headers: { "Content-Type": "application/json" } }
            );
          }

          // Read file into buffer
          const buffer = Buffer.from(await file.arrayBuffer());

          // Store in memory
          const result = storeUploadedFile(file.name, file.type, buffer);

          if (result.error) {
            return new Response(
              JSON.stringify({ error: result.error }),
              { status: 507, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({
              fileId: result.fileId,
              name: file.name,
              size: file.size,
              mimeType: file.type,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("[steuerstoff-upload] error:", error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Upload failed",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
