"use client";

import { Upload, X, FileText } from "lucide-react";
import { useState, useRef } from "react";

interface FileFieldProps {
  label?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

export function FileField({
  label = "File Upload",
  helperText = "Drag and drop or click to upload",
  accept = "*/*",
  multiple = false,
  required = false,
  disabled = false,
  onChange,
}: FileFieldProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    const updatedFiles = multiple ? [...files, ...fileArray] : fileArray;
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
          isDragOver
            ? "border-brand bg-brand/5"
            : "border-border hover:border-border-focus/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="w-8 h-8 text-text-muted mb-2" />
        <p className="text-sm text-text-secondary">{helperText}</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 px-3 py-2 bg-base border border-border rounded-lg"
            >
              <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="flex-1 text-sm text-text-primary truncate">
                {file.name}
              </span>
              <span className="text-xs text-text-muted">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-error/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-error" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
