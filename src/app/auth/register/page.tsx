"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EmailVerification from "@/components/EmailVerification";
import { useAuth } from "@/hooks/useAuth";
import { useCountriesList } from "@/hooks/useCountries";
import { useAppDispatch } from "@/store/hooks";
import {
  initiateGoogleRedirect,
  processGoogleRedirect,
} from "@/lib/googleAuth";
import { getErrorMessageKey } from "@/lib/errorUtils";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";

export default function RegisterPage() {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    registerUser,
    requestOtp,
    login,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
  } = useAuth();
  const {
    countries,
    getCountries,
    isLoading: isLoadingCountries,
  } = useCountriesList();
  const [step, setStep] = useState<"form" | "verification">("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryId: "",
  });
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
          // Registration/Login successful - redirect to onboarding
          router.replace("/onboarding/interests");
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
          console.error("[Register] Redirect check error:", error);
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
  }, [dispatch, router]);

  // Fetch countries on mount
  useEffect(() => {
    if (countries.length === 0) {
      getCountries();
    }
  }, [countries.length, getCountries]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast(t("auth.fillAllFields"), "error");
      return;
    }

    if (!formData.email.includes("@")) {
      showToast(t("auth.invalidEmail"), "error");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Register user first
      const registerResult = await registerUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        countryId: formData.countryId || undefined,
      });

      const isRegisterFulfilled =
        registerResult &&
        "payload" in registerResult &&
        registerResult.type.includes("fulfilled");

      if (!isRegisterFulfilled) {
        const errorMsg = authError || "Registration failed";
        const errorKey = getErrorMessageKey(errorMsg);
        showToast(errorKey ? t(errorKey) : t("errors.registration"), "error");
        setLoading(false);
        return;
      }

      // Step 2: After successful registration, request OTP
      const otpResult = await requestOtp(formData.email);
      const isOtpFulfilled =
        otpResult &&
        "payload" in otpResult &&
        otpResult.type.includes("fulfilled");

      if (isOtpFulfilled) {
        setStep("verification");
        showToast(t("auth.otpSent"), "success");
      } else {
        const errorMsg = authError || "Failed to send OTP";
        const errorKey = getErrorMessageKey(errorMsg);
        showToast(errorKey ? t(errorKey) : t("errors.requestOtp"), "error");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Registration failed";
      const errorKey = getErrorMessageKey(errorMessage);
      showToast(errorKey ? t(errorKey) : t("errors.registration"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (otp: string) => {
    setLoading(true);
    try {
      // Call login API with email and OTP (not register)
      const result = await login({ email: formData.email, otp });

      const isFulfilled =
        result && "payload" in result && result.type.includes("fulfilled");

      if (isFulfilled && result.payload) {
        const { accessToken, user } = result.payload as any;

        if (accessToken && user && typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
        }

        showToast(t("common.success"), "success");

        if (accessToken && user) {
          router.replace("/onboarding/interests");
          return;
        }

        router.replace("/auth/login?redirect=/onboarding/interests");
        return;
      } else if (authError) {
        const errorKey = getErrorMessageKey(authError);
        showToast(errorKey ? t(errorKey) : authError, "error");
      } else {
        showToast(t("errors.login"), "error");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed";
      const errorKey = getErrorMessageKey(errorMessage);
      showToast(errorKey ? t(errorKey) : t("errors.login"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendLoading || loading) return; // Prevent multiple clicks or if already loading

    // Make sure loading is false when resending
    setLoading(false);
    setResendLoading(true);
    try {
      const result = await requestOtp(formData.email);
      if (result && "payload" in result && result.type.includes("fulfilled")) {
        showToast(t("auth.otpSent"), "success");
      } else {
        const errorMsg = authError || "Failed to send OTP";
        const errorKey = getErrorMessageKey(errorMsg);
        showToast(errorKey ? t(errorKey) : t("errors.requestOtp"), "error");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send OTP";
      const errorKey = getErrorMessageKey(errorMessage);
      showToast(errorKey ? t(errorKey) : t("errors.requestOtp"), "error");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verification") {
      setStep("form");
    } else {
      router.back();
    }
  };

  const handleGoogleSignUpClick = async () => {
    setGoogleLoading(true);
    try {
      // Initiate Google sign-in (popup on desktop, redirect on mobile)
      const result = await initiateGoogleRedirect(dispatch);

      // On mobile, result.success will be true but no user (redirect will happen)
      // On desktop, result will have user if successful
      if (result.success && result.user) {
        // Desktop: popup completed - redirect to onboarding
        router.replace("/onboarding/interests");
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
            console.error("[Register] Google sign-in failed:", result.error);
          }
        }
      } else {
        setGoogleLoading(false);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Register] Google sign-in error:", error);
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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 sm:mb-8 p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Welcome Message */}
          <div className="mb-6 sm:mb-8">
            <Typography
              variant="h3"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2"
            >
              {step === "form" ? t("auth.createAccount") : t("auth.enterOTP")}
            </Typography>
            {step === "form" ? (
              <Typography className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center">
                {t("auth.createAccountSubtitle")}
              </Typography>
            ) : (
              <Typography className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center">
                {t("auth.otpSent")}
              </Typography>
            )}
          </div>

          {/* Registration Form */}
          {step === "form" && (
            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 sm:space-y-6"
            >
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("auth.firstName")}
                  </label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    fullWidth
                    required
                    className="h-11 sm:h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("auth.lastName")}
                  </label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    fullWidth
                    required
                    className="h-11 sm:h-12"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("common.email")}
                </label>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  fullWidth
                  required
                  className="h-11 sm:h-12"
                />
              </div>

              {/* Country Select */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("common.country")}
                </label>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.countryId || ""}
                    onChange={(e: SelectChangeEvent<string>) =>
                      handleInputChange("countryId", e.target.value)
                    }
                    displayEmpty
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-11 sm:h-12"
                    disabled={isLoadingCountries}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(156, 163, 175, 0.5)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(156, 163, 175, 0.8)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#9333ea",
                      },
                      "& .MuiSelect-select": {
                        padding: "8px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      },
                      pr: 2,
                      pl: 2,
                      "& .MuiSelect-icon": {
                        right: 8,
                        left: "auto",
                        color: "rgb(107 114 128)",
                      },
                      '[dir="rtl"] & .MuiSelect-icon': {
                        left: 8,
                        right: "auto",
                      },
                      ".dark & .MuiSelect-icon": {
                        color: "rgb(156 163 175)",
                      },
                      ".dark &": {
                        color: "rgb(249 250 251)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(75, 85, 99, 0.5)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(75, 85, 99, 0.8)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#9333ea",
                        },
                      },
                    }}
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        sx: {
                          backgroundColor: "rgb(255 255 255)",
                          ".dark &": {
                            backgroundColor: "rgb(55 65 81)",
                          },
                        },
                      },
                    }}
                    renderValue={(value) => {
                      if (!value) {
                        return (
                          <span className="text-gray-500 dark:text-gray-400">
                            {t("common.selectCountry")}
                          </span>
                        );
                      }
                      const selectedCountry = countries.find(
                        (c) => c.id === value
                      );
                      if (!selectedCountry) return "";
                      const flag = getCountryFlag(selectedCountry.countryCode);
                      const translatedName = getCountryName(
                        selectedCountry.countryCode,
                        currentLanguage.code as "ar" | "en"
                      );
                      const displayName =
                        translatedName || selectedCountry.countryName || "";
                      return (
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{flag}</span>
                          <span>{displayName}</span>
                        </span>
                      );
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{
                        color: "rgb(107 114 128)",
                        ".dark &": {
                          color: "rgb(156 163 175)",
                        },
                      }}
                    >
                      {t("common.selectCountry")}
                    </MenuItem>
                    {isLoadingCountries ? (
                      <MenuItem value="" disabled>
                        {t("common.loading")}
                      </MenuItem>
                    ) : (
                      countries.map((country) => {
                        const flag = getCountryFlag(country.countryCode);
                        const translatedName = getCountryName(
                          country.countryCode,
                          currentLanguage.code as "ar" | "en"
                        );
                        const displayName =
                          translatedName || country.countryName || "";
                        return (
                          <MenuItem
                            key={country.id}
                            value={country.id}
                            sx={{
                              color: "rgb(17 24 39)",
                              "&.Mui-selected": {
                                backgroundColor: "rgb(239 246 255)",
                              },
                              "&.Mui-selected:hover": {
                                backgroundColor: "rgb(219 234 254)",
                              },
                              ".dark &": {
                                color: "rgb(249 250 251)",
                                "&.Mui-selected": {
                                  backgroundColor: "rgb(30 58 138)",
                                },
                                "&.Mui-selected:hover": {
                                  backgroundColor: "rgb(37 99 235)",
                                },
                              },
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{flag}</span>
                              <span>{displayName}</span>
                            </span>
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                loading={loading}
                sx={{ color: "white !important" }}
              >
                {t("auth.register")}
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
                onClick={handleGoogleSignUpClick}
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
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs sm:text-sm"
                    onClick={() => router.push("/auth/login")}
                  >
                    {t("auth.signIn")}
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

          {/* Email Verification */}
          {step === "verification" && (
            <EmailVerification
              email={formData.email}
              onBack={() => setStep("form")}
              onVerify={handleVerification}
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
            alt="register-bg"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
