"use client";

import { useState, useEffect } from "react";
import { Typography, Divider } from "@mui/material";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/ui/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import EmailVerification from "@/components/EmailVerification";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import {
  initiateGoogleRedirect,
  processGoogleRedirect,
} from "@/lib/googleAuth";
import { getErrorMessageKey } from "@/lib/errorUtils";

export default function LoginPage() {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    login,
    requestOtp,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
  } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // Check for Google redirect result on mobile when page loads
  useEffect(() => {
    let isMounted = true;
    let hasChecked = false;

    const checkRedirect = async () => {
      if (hasChecked || !isMounted) return;
      hasChecked = true;

      // Check if redirect was initiated
      const redirectInitiated =
        typeof window !== "undefined" &&
        sessionStorage.getItem("google_redirect_initiated") === "true";

      if (!redirectInitiated) {
        // No redirect initiated, show page immediately
        if (isMounted) {
          setCheckingRedirect(false);
        }
        return;
      }

      // Redirect was initiated, start checking
      if (isMounted) {
        setCheckingRedirect(true);
      }

      // Wait for Firebase to initialize
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isMounted) return;

      try {
        const result = await processGoogleRedirect(dispatch);

        if (!isMounted) return;

        if (result.success && result.user) {
          // Registration/Login successful - redirect based on user type
          if (result.user.isAdmin) {
            router.replace("/admin");
          } else {
            const redirect = searchParams.get("redirect");
            router.replace(redirect || "/");
          }
        } else if (result.error) {
          // Redirect failed or not found - stop loading and show page
          if (isMounted) {
            setCheckingRedirect(false);
            setGoogleLoading(false);
          }
        } else {
          // No redirect result - show page
          if (isMounted) {
            setCheckingRedirect(false);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Login] Redirect check error:", error);
        }
        if (isMounted) {
          setCheckingRedirect(false);
          setGoogleLoading(false);
        }
      }
    };

    checkRedirect();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router, searchParams]);

  const sendOtp = async (isResend: boolean = false) => {
    if (!email) {
      showToast(t("auth.enterEmail"), "error");
      return false;
    }

    if (!email.includes("@")) {
      showToast(t("auth.invalidEmail"), "error");
      return false;
    }

    try {
      // Use resendLoading if resending, otherwise use loading
      if (isResend) {
        // Make sure loading is false when resending to avoid affecting verify button
        setLoading(false);
        setResendLoading(true);
      } else {
        setLoading(true);
      }

      const result = await requestOtp(email);
      if (result && "payload" in result && result.type.includes("fulfilled")) {
        if (!isResend) {
          setStep("otp");
        }
        showToast(t("auth.otpSent"), "success");
        return true;
      } else if (authError) {
        const errorKey = getErrorMessageKey(authError);
        showToast(errorKey ? t(errorKey) : authError, "error");
        return false;
      } else {
        showToast(t("errors.requestOtp"), "error");
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send OTP";
      const errorKey = getErrorMessageKey(errorMessage);
      showToast(errorKey ? t(errorKey) : t("errors.requestOtp"), "error");
      return false;
    } finally {
      if (isResend) {
        setResendLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any event bubbling that might cause reload
    await sendOtp();
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);
    try {
      // Call login API with email and OTP
      const result = await login({ email, otp });

      // Check if the result is fulfilled (login successful)
      if (result && "payload" in result && result.type.includes("fulfilled")) {
        showToast(t("common.success"), "success");

        // Check if user is admin and redirect accordingly
        const userData = (result.payload as any)?.user;
        if (userData?.isAdmin) {
          router.push("/admin"); // Redirect to admin dashboard
        } else {
          const redirect = searchParams.get("redirect");
          router.push(redirect ? redirect : "/");
        }
      } else {
        // Login failed - do NOT redirect or reload
        // Only show error message and stay on the same page
        const errorMessage = authError || "Login failed";
        const errorKey = getErrorMessageKey(errorMessage);
        showToast(errorKey ? t(errorKey) : t("errors.login"), "error");
        // Stay on OTP step to allow user to retry
        // Do NOT redirect or reload the page
      }
    } catch (error: any) {
      // Catch any unexpected errors - do NOT redirect or reload
      const errorMessage = error?.message || "Login failed";
      const errorKey = getErrorMessageKey(errorMessage);
      showToast(errorKey ? t(errorKey) : t("errors.login"), "error");
      // Stay on OTP step to allow user to retry
      // Do NOT redirect or reload the page
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
  };

  const handleResendOtp = async () => {
    if (resendLoading || loading) return; // Prevent multiple clicks or if already loading
    await sendOtp(true); // Pass true to indicate this is a resend
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Initiate Google sign-in (popup on desktop, redirect on mobile)
      const result = await initiateGoogleRedirect(dispatch);

      // On mobile, result.success will be true but no user (redirect will happen)
      // On desktop, result will have user if successful
      if (result.success && result.user) {
        // Desktop: popup completed - redirect based on user type
        if (result.user.isAdmin) {
          router.replace("/admin");
        } else {
          const redirect = searchParams.get("redirect");
          router.replace(redirect || "/");
        }
      } else if (result.success && !result.user) {
        // Mobile: redirect initiated, wait for redirect to complete
        // The useEffect will handle the redirect result
        // Don't set loading to false here - keep it loading until redirect completes
      } else if (result.error) {
        // Show error message
        setGoogleLoading(false);
        if (result.error.includes("not configured")) {
          showToast(result.error, "error");
        } else if (result.error.includes("popup")) {
          showToast(result.error, "error");
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("[Login] Google sign-in failed:", result.error);
          }
        }
      } else {
        setGoogleLoading(false);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Login] Google sign-in error:", error);
      }
      setGoogleLoading(false);
    }
  };

  // Show loader while checking redirect
  if (checkingRedirect) {
    return (
      <div className="min-h-screen py-8 sm:py-12 md:py-20 px-4 sm:px-5 flex items-center justify-center">
        <div className="w-full max-w-sm flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mb-4"></div>
          <Typography className="text-center text-gray-600 dark:text-gray-300">
            {t("common.loading") || "جاري التحميل..."}
          </Typography>
          <Typography className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t("auth.completingSignIn") || "جارٍ إكمال تسجيل الدخول..."}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Welcome Message */}
          <div className="mb-6 sm:mb-8">
            <Typography
              variant="h3"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2"
            >
              {step === "email" ? t("auth.welcomeBack") : t("auth.enterOTP")}
            </Typography>
            {step === "email" ? (
              <div className="space-y-1 sm:space-y-2">
                <Typography className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center">
                  {t("auth.welcomeSubtitle1")}
                </Typography>
                <Typography className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center">
                  {t("auth.welcomeSubtitle2")}
                </Typography>
              </div>
            ) : (
              <Typography className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center">
                {t("auth.otpSent")}
              </Typography>
            )}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-4 sm:space-y-6"
            >
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
                  className="h-11 sm:h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                loading={loading}
                sx={{ color: "white !important" }}
              >
                {t("common.signIn")}
              </Button>

              <div className="relative my-4 sm:my-6">
                <Divider />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 px-3 sm:px-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {t("auth.or")}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                loading={googleLoading}
                className="w-full h-11 sm:h-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
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
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    <Image
                      src="/images/Google.png"
                      alt="google"
                      width={20}
                      height={20}
                      className="sm:w-[25px] sm:h-[25px] object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-base">
                    {googleLoading
                      ? t("common.loading") || "جاري التحميل..."
                      : t("auth.signUpWithGoogle")}
                  </span>
                </div>
              </Button>

              <div className="text-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t("auth.dontHaveAccount")}{" "}
                  <Button
                    onClick={() => router.push("/auth/register")}
                    variant="ghost"
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm"
                  >
                    {t("auth.signUp")}
                  </Button>
                </span>
              </div>

              <div className="text-center mt-6 sm:mt-8">
                <Typography className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                  {t("footer.copyright")}
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
              resendLoading={resendLoading}
            />
          )}
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center px-8 py-12">
        <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/images/LoginArt.png"
            alt="login-bg"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
