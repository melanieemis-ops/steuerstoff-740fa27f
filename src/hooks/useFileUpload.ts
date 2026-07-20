import { useCallback } from "react";
import { uploadFileWithProgress } from "@/lib/upload-files";

export function useFileUpload() {
  return useCallback(
    (file: File, onProgress?: (progress: number) => void) =>
      uploadFileWithProgress(file, onProgress),
    [],
  );
}
