"use client";

import React, { useRef, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Upload, X, File, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";
import {
  uploadImage,
  uploadFile,
  formatFileSize,
} from "@/services/uploadService";
import type { UploadProgress } from "@/services/uploadService";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  /**
   * Type of upload: 'image' or 'file'
   */
  type?: "image" | "file";
  /**
   * Current file URL (for displaying existing file)
   */
  value?: string;
  /**
   * Callback when file is uploaded
   */
  onChange: (url: string) => void;
  /**
   * Callback when file is removed
   */
  onRemove?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Accept attribute for file input
   */
  accept?: string;
  /**
   * Max file size in MB
   */
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type = "image",
  value,
  onChange,
  onRemove,
  className,
  disabled = false,
  accept,
  maxSize,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const defaultAccept = type === "image" ? "image/*" : "*/*";
  const defaultMaxSize = type === "image" ? 10 : 20;

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress(null);

      try {
        const uploadFn = type === "image" ? uploadImage : uploadFile;
        const url = await uploadFn(file, (progress) => {
          setUploadProgress(progress);
        });

        onChange(url);
      } catch (err: any) {
        setError(err.message || t("upload.error"));
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [type, onChange, t]
  );

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      // Validate file type for images
      if (type === "image" && !file.type.startsWith("image/")) {
        setError(t("upload.invalidImageType"));
        return;
      }

      // Validate file size
      const maxSizeBytes = (maxSize || defaultMaxSize) * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(
          t("upload.fileTooLarge", {
            size: (maxSize || defaultMaxSize).toString(),
          })
        );
        return;
      }

      handleUpload(file);
    },
    [type, maxSize, defaultMaxSize, handleUpload, t]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file || null);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      {value && !isUploading ? (
        // Display uploaded file
        <div className="relative">
          {type === "image" ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-48 object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {value.split("/").pop()}
                  </p>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    {t("upload.viewFile")}
                  </a>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Upload area
        <div
          onClick={!disabled && !isUploading ? handleClick : undefined}
          onDragOver={!disabled && !isUploading ? handleDragOver : undefined}
          onDragLeave={!disabled && !isUploading ? handleDragLeave : undefined}
          onDrop={!disabled && !isUploading ? handleDrop : undefined}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer bg-gray-50 dark:bg-gray-800",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-[1.02]"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-750",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "cursor-wait"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept || defaultAccept}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("upload.uploading")}
              </p>
              {uploadProgress && (
                <div className="w-48">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {uploadProgress.percentage}%
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {type === "image" ? (
                <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
              )}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("upload.clickOrDrag")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {type === "image"
                  ? t("upload.imageLimit", {
                      size: (maxSize || defaultMaxSize).toString(),
                    })
                  : t("upload.fileLimit", {
                      size: (maxSize || defaultMaxSize).toString(),
                    })}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
