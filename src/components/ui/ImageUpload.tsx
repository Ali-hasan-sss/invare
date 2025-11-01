"use client";

import React from "react";
import { FileUpload } from "./FileUpload";

interface ImageUploadProps {
  /**
   * Current image URL
   */
  value?: string;
  /**
   * Callback when image is uploaded
   */
  onChange: (url: string) => void;
  /**
   * Callback when image is removed
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
}

/**
 * Simplified component for image uploads only
 */
export const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  return <FileUpload {...props} type="image" accept="image/*" />;
};

