import apiClient from "@/lib/apiClient";
import { API_CONFIG } from "@/config/api";

export interface UploadResponse {
  url: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload an image file
 * @param file - Image file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the uploaded file URL
 */
export const uploadImage = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (10 MB)
  const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 10 MB");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UploadResponse>(
      API_CONFIG.ENDPOINTS.UPLOADS.IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      }
    );

    return response.data.url;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload image");
  }
};

/**
 * Upload a file
 * @param file - File to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the uploaded file URL
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Validate file size (20 MB)
  const maxSize = 20 * 1024 * 1024; // 20 MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size must be less than 20 MB");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UploadResponse>(
      API_CONFIG.ENDPOINTS.UPLOADS.FILE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      }
    );

    return response.data.url;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
