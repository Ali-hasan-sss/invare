"use client";

import React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "standard" | "filled" | "outlined";
  error?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "outlined",
      error,
      helperText,
      sx: externalSx,
      ...props
    },
    ref
  ) => {
    const baseStyles: SxProps<Theme> = {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgb(156 163 175)", // gray-400
            },
            "&:hover fieldset": {
              borderColor: "rgb(59 130 246)", // blue-500
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgb(0 123 255)", // brand-blue
            },
            "& input": {
              color: "rgb(17 24 39) !important", // gray-900 for light mode
            },
            "& textarea": {
              color: "rgb(17 24 39) !important", // gray-900 for light mode
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgb(107 114 128)", // gray-500
            "&.Mui-focused": {
              color: "rgb(0 123 255)", // brand-blue
            },
          },
          // Dark mode styles using CSS selector
          ".dark & .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgb(75 85 99) !important", // gray-600
            },
            "&:hover fieldset": {
              borderColor: "rgb(107 114 128) !important", // gray-500
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgb(0 123 255) !important", // brand-blue
            },
            "& input": {
              color: "rgb(249 250 251) !important", // gray-50 for dark mode
            },
            "& textarea": {
              color: "rgb(249 250 251) !important", // gray-50 for dark mode
            },
          },
          ".dark & .MuiInputLabel-root": {
            color: "rgb(156 163 175) !important", // gray-400
            "&.Mui-focused": {
              color: "rgb(0 123 255) !important", // brand-blue
            },
          },
    };

    const combinedSx: SxProps<Theme> = Array.isArray(externalSx)
      ? [baseStyles, ...externalSx]
      : externalSx
      ? [baseStyles, externalSx]
      : baseStyles;

    return (
      <TextField
        ref={ref}
        variant={variant}
        error={error}
        helperText={helperText}
        className={cn("w-full  dark:text-white", className)}
        sx={combinedSx}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
