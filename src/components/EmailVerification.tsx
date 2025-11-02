"use client";

import React from "react";
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
  onResend?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onBack,
  onVerify,
  loading = false,
  onResend,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const [otp, setOtp] = React.useState("");

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("");
    setOtp(updatedOtp);

    // Auto-focus next input based on direction
    if (value) {
      const container = (e.target as HTMLElement).closest(".otp-container");
      const inputs = container?.querySelectorAll(
        "input"
      ) as NodeListOf<HTMLInputElement>;
      const isRTL = currentLanguage.dir === "rtl";
      const nextIndex = isRTL ? index - 1 : index + 1;

      if (nextIndex >= 0 && nextIndex < 6) {
        inputs[nextIndex]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setOtp(pastedData);

    // Focus the last filled input or the first empty one
    const container = (e.target as HTMLElement).closest(".otp-container");
    const inputs = container?.querySelectorAll("input");
    if (inputs) {
      const focusIndex = Math.min(pastedData.length, 5);
      (inputs[focusIndex] as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    const container = (e.target as HTMLElement).closest(".otp-container");
    const inputs = container?.querySelectorAll(
      "input"
    ) as NodeListOf<HTMLInputElement>;

    // Determine direction based on language
    const isRTL = currentLanguage.dir === "rtl";
    const prevIndex = isRTL ? index + 1 : index - 1;
    const nextIndex = isRTL ? index - 1 : index + 1;

    if (e.key === "Backspace") {
      e.preventDefault();

      if (otp[index]) {
        // If current input has value, clear it
        const newOtp = otp.split("");
        newOtp[index] = "";
        setOtp(newOtp.join(""));
      } else if (prevIndex >= 0 && prevIndex < 6) {
        // If current input is empty, go to previous and clear it
        const newOtp = otp.split("");
        newOtp[prevIndex] = "";
        setOtp(newOtp.join(""));
        inputs[prevIndex]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isRTL && nextIndex >= 0) {
        // In RTL, left arrow goes to next input
        inputs[nextIndex]?.focus();
      } else if (!isRTL && prevIndex >= 0) {
        // In LTR, left arrow goes to previous input
        inputs[prevIndex]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isRTL && prevIndex >= 0) {
        // In RTL, right arrow goes to previous input
        inputs[prevIndex]?.focus();
      } else if (!isRTL && nextIndex < 6) {
        // In LTR, right arrow goes to next input
        inputs[nextIndex]?.focus();
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      // Clear current input and move to next
      const newOtp = otp.split("");
      newOtp[index] = "";
      setOtp(newOtp.join(""));
      if (nextIndex < 6) {
        inputs[nextIndex]?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast(t("auth.enterOTP"), "error");
      return;
    }
    onVerify(otp);
  };

  const handleResendOtp = () => {
    if (onResend) {
      onResend();
    } else {
      showToast(t("auth.resendOTP"), "info");
    }
  };

  return (
    <Box className="w-full">
      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`otp-container flex justify-center gap-3 ${
            currentLanguage.dir === "rtl" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Input
              key={index}
              type="text"
              value={otp[index] || ""}
              onChange={(e) => handleOtpChange(e, index)}
              onPaste={handleOtpPaste}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              className="w-16 h-16 text-center text-xl font-bold"
              inputProps={{
                maxLength: 1,
                dir: currentLanguage.dir,
                inputMode: "numeric",
                pattern: "[0-9]",
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
                  },
                  "& input": {
                    color: "rgb(17 24 39) !important", // gray-900
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    direction: currentLanguage.dir,
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
              }}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          loading={loading}
          disabled={otp.length !== 6}
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
            >
              {t("auth.resendOTP")}
            </Button>
          </span>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to email
          </Button>
        </div>
      </form>
    </Box>
  );
};

export default EmailVerification;
