"use client";

import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
  loading?: boolean;
  onResend?: () => Promise<void> | void;
  resendLoading?: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onBack,
  onVerify,
  loading = false,
  onResend,
  resendLoading = false,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isRTL = currentLanguage.dir === "rtl";
  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && otp.every((digit) => digit === "")) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, []);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const inputValue = e.target.value;
    const value = inputValue.replace(/\D/g, "");

    // Handle paste or multiple digits
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      const newOtp = [...otp];

      // Find the first empty index (starting from left)
      let startIndex = 0;
      for (let i = 0; i < 6; i++) {
        if (!newOtp[i]) {
          startIndex = i;
          break;
        }
      }

      // Fill from the first empty index (left to right)
      digits.forEach((digit, i) => {
        const targetIndex = startIndex + i;
        if (targetIndex < 6) {
          newOtp[targetIndex] = digit;
        }
      });

      setOtp(newOtp);

      // Focus the next empty input or last input (always move right)
      const lastFilledIndex = Math.min(startIndex + digits.length - 1, 5);
      const nextIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 10);
    } else if (value.length === 1) {
      // Single digit input - always fill from left to right
      const newOtp = [...otp];

      // Find the first empty index (starting from left)
      let targetIndex = index;
      for (let i = 0; i < index; i++) {
        if (!newOtp[i]) {
          targetIndex = i;
          break;
        }
      }

      // If target index already has a value, move to next empty
      if (newOtp[targetIndex]) {
        for (let i = targetIndex + 1; i < 6; i++) {
          if (!newOtp[i]) {
            targetIndex = i;
            break;
          }
        }
      }

      // Fill the target index
      newOtp[targetIndex] = value;
      setOtp(newOtp);

      // Move to next input (always move right, LTR)
      const nextIndex = targetIndex + 1;
      if (nextIndex < 6) {
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 10);
      }
    } else if (inputValue === "") {
      // Clear current input (when user deletes)
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 0) return;

    const digits = pastedData.split("");
    const newOtp = [...otp];

    // Always find the first empty index (starting from left)
    let startIndex = 0;
    for (let i = 0; i < 6; i++) {
      if (!newOtp[i]) {
        startIndex = i;
        break;
      }
    }

    // Fill from the first empty index (left to right)
    digits.forEach((digit, i) => {
      const targetIndex = startIndex + i;
      if (targetIndex < 6) {
        newOtp[targetIndex] = digit;
      }
    });

    setOtp(newOtp);

    // Focus the next empty input or last input (always move right)
    const lastFilledIndex = Math.min(startIndex + digits.length - 1, 5);
    const nextIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;

    setTimeout(() => {
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }, 10);
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    // Always use LTR navigation (left = previous, right = next)
    const prevIndex = index - 1;
    const nextIndex = index + 1;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // If current input has value, clear it
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (prevIndex >= 0) {
        // If current input is empty, go to previous (left) and clear it
        newOtp[prevIndex] = "";
        setOtp(newOtp);
        setTimeout(() => {
          inputRefs.current[prevIndex]?.focus();
        }, 10);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      // Left arrow always goes to previous (left) input
      if (prevIndex >= 0) {
        inputRefs.current[prevIndex]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      // Right arrow always goes to next (right) input
      if (nextIndex < 6) {
        inputRefs.current[nextIndex]?.focus();
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      // Clear current input and move to next (right)
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (nextIndex < 6) {
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 10);
      }
    }
  };

  const handleInputFocus = (index: number) => {
    // When focusing, select all text if any
    if (inputRefs.current[index] && otp[index]) {
      inputRefs.current[index]?.select();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (!otpString || otpString.length !== 6) {
      showToast(t("auth.enterOTP"), "error");
      return;
    }
    onVerify(otpString);
  };

  const handleResendOtp = async () => {
    if (onResend) {
      await onResend();
    } else {
      showToast(t("auth.resendOTP"), "info");
    }
  };

  return (
    <Box className="w-full">
      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`otp-container flex justify-center gap-2 sm:gap-3 ${
            isRTL ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Input
              key={index}
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              value={otp[index] || ""}
              onChange={(e) => handleOtpChange(e, index)}
              onPaste={handleOtpPaste}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              onFocus={() => handleInputFocus(index)}
              data-index={index}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold"
              inputProps={{
                maxLength: 1,
                dir: "ltr", // Always LTR for numbers
                inputMode: "numeric",
                pattern: "[0-9]",
                "aria-label": `${t("auth.otpDigit")} ${index + 1}`,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgb(209 213 219)", // gray-300
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(156 163 175)", // gray-400
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgb(20 184 166)", // teal-500
                    borderWidth: "2px",
                  },
                  "& input": {
                    color: "rgb(17 24 39) !important", // gray-900
                    textAlign: "center",
                    fontSize: "1.125rem", // text-lg on mobile
                    fontWeight: "bold",
                    direction: "ltr", // Always LTR for numbers
                    padding: "8px !important",
                  },
                },
                // Dark mode styles
                ".dark & .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgb(75 85 99) !important", // gray-600
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(107 114 128) !important", // gray-500
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgb(45 212 191) !important", // teal-400
                  },
                  "& input": {
                    color: "rgb(249 250 251) !important", // gray-50
                  },
                },
                // Responsive font sizes
                "@media (min-width: 640px)": {
                  "& .MuiOutlinedInput-root input": {
                    fontSize: "1.25rem !important", // text-xl on sm
                  },
                },
                "@media (min-width: 768px)": {
                  "& .MuiOutlinedInput-root input": {
                    fontSize: "1.5rem !important", // text-2xl on md
                  },
                },
              }}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          loading={loading}
          disabled={otp.join("").length !== 6}
          sx={{ color: "white !important" }}
        >
          {t("auth.verify")}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.didntReceiveCode")}{" "}
            <Button
              variant="ghost"
              className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {t("auth.resendOTP")}
            </Button>
          </span>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            {t("auth.backToEmail")}
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default EmailVerification;
