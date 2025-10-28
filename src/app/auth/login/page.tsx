"use client";

import { useState } from "react";
import { Container, Box, Typography, Divider } from "@mui/material";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EmailVerification from "@/components/EmailVerification";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const {
    login,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
  } = useAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast(t("auth.enterEmail"), "error");
      return;
    }

    if (!email.includes("@")) {
      showToast("Please enter a valid email", "error");
      return;
    }

    setLoading(true);
    // Just move to OTP step without sending request
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      showToast(t("auth.otpSent"), "success");
    }, 1000);
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);
    try {
      // Call login API with email and OTP
      const result = await login({ email, otp });

      // Check if the result is fulfilled (login successful)
      if (result && "payload" in result && result.type.includes("fulfilled")) {
        showToast(t("common.success"), "success");
        router.push("/"); // Redirect to home page after successful login
      } else if (authError) {
        showToast(authError, "error");
      } else {
        showToast("Login failed", "error");
      }
    } catch (error) {
      showToast("Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
  };

  const handleResendOtp = () => {
    showToast(t("auth.resendOTP"), "info");
  };

  const handleGoogleSignIn = () => {
    showToast("Google Sign In - Coming Soon", "info");
  };

  return (
    <div className="min-h-screen py-20 md:px-5 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8  backdrop-blur-sm rounded-2xl mx-4 my-8 ">
        <Container maxWidth="sm" className="w-full max-w-md">
          <Box className="w-full">
            {/* Welcome Message */}
            <div className="mb-8">
              <Typography
                variant="h3"
                className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2"
              >
                {step === "email" ? t("auth.welcomeBack") : t("auth.enterOTP")}
              </Typography>
              {step === "email" ? (
                <div className="space-y-2">
                  <Typography className="text-gray-600 dark:text-gray-300 text-center">
                    {t("auth.welcomeSubtitle1")}
                  </Typography>
                  <Typography className="text-gray-600 dark:text-gray-300 text-center">
                    {t("auth.welcomeSubtitle2")}
                  </Typography>
                </div>
              ) : (
                <Typography className="text-gray-600 dark:text-gray-300 text-center">
                  {t("auth.otpSent")}
                </Typography>
              )}
            </div>

            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-center text-gray-700 dark:text-gray-300">
                    {t("common.email")}
                  </label>
                  <Input
                    type="email"
                    placeholder="Example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  loading={loading}
                  sx={{ color: "white !important" }}
                >
                  {t("common.signIn")}
                </Button>

                <div className="relative my-6">
                  <Divider />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 px-4 text-gray-500 dark:text-gray-400 text-sm">
                    {t("auth.or")}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
                  sx={{
                    color: "rgb(55 65 81) !important", // gray-700 for light mode
                    "&:hover": {
                      backgroundColor: "rgb(249 250 251) !important", // gray-50
                      color: "rgb(17 24 39) !important", // gray-900
                    },
                    // Dark mode styles
                    ".dark &": {
                      color: "rgb(209 213 219) !important", // gray-300
                      "&:hover": {
                        backgroundColor: "rgb(55 65 81) !important", // gray-700
                        color: "rgb(243 244 246) !important", // gray-100
                      },
                    },
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Image
                        src="/images/Google.png"
                        alt="google"
                        width={25}
                        height={25}
                        className="object-contain"
                      />
                    </div>
                    <span>{t("auth.signInWithGoogle")}</span>
                  </div>
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("auth.dontHaveAccount")}{" "}
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {t("auth.signUp")}
                    </Button>
                  </span>
                </div>

                <div className="text-center mt-8">
                  <Typography className="text-xs text-gray-400 dark:text-gray-500">
                    © 2025 ALL RIGHTS RESERVED
                  </Typography>
                </div>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <EmailVerification
                email={email}
                onBack={() => setStep("email")}
                onVerify={(otp) => handleOtpSubmit(otp)}
                loading={loading}
                onResend={handleResendOtp}
              />
            )}
          </Box>
        </Container>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <Image
            src="/images/LoginArt.png"
            alt="login-bg"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
