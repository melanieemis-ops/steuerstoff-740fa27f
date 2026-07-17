/**
 * FileDropZone.tsx
 * 
 * Drag-and-drop zone for desktop file uploads.
 * Shows overlay when files are dragged over chat area.
 */

import { useRef, useEffect, useState } from "react";

interface FileDropZoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropZone({ onDrop, disabled = false }: FileDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const zone = dropZoneRef.current;
    if (!zone) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        e.dataTransfer?.types.includes("Files") ||
        e.dataTransfer?.types.includes("application/x-moz-file")
      ) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if we're leaving the drop zone entirely
      if (e.target === zone) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        onDrop(files);
      }
    };

    zone.addEventListener("dragenter", handleDragEnter as EventListener);
    zone.addEventListener("dragover", handleDragOver as EventListener);
    zone.addEventListener("dragleave", handleDragLeave as EventListener);
    zone.addEventListener("drop", handleDrop as EventListener);

    return () => {
      zone.removeEventListener("dragenter", handleDragEnter as EventListener);
      zone.removeEventListener("dragover", handleDragOver as EventListener);
      zone.removeEventListener("dragleave", handleDragLeave as EventListener);
      zone.removeEventListener("drop", handleDrop as EventListener);
    };
  }, [onDrop, disabled]);

  return (
    <>
      <div ref={dropZoneRef} className="absolute inset-0 pointer-events-none" />

      {/* Drag overlay */}
      {isDragging && !disabled && (
        <div
          className="absolute inset-0 z-20 rounded-3xl border-2 border-dashed flex items-center justify-center pointer-events-none"
          style={{
            borderColor: "rgba(0, 255, 255, 0.5)",
            background: "rgba(0, 255, 255, 0.03)",
            boxShadow:
              "0 0 0 1px rgba(255, 0, 255, 0.2), inset 0 0 32px rgba(0, 255, 255, 0.05)",
          }}
        >
          <p className="text-sm font-medium text-cyan-400">Dateien hier ablegen</p>
        </div>
      )}
    </>
  );
}
