"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
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

export default function RegisterPage() {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const {
    registerUser,
    // requestOtp,
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

  const sendOtp = async () => {
    try {
      setLoading(true);
      // Temporary bypass for OTP request
      // const result = await requestOtp(formData.email);
      // if (result && "payload" in result && result.type.includes("fulfilled")) {
      setStep("verification");
      showToast(t("auth.otpSent"), "success");
      // } else if (authError) {
      //   showToast(authError, "error");
      // } else {
      //   showToast("Failed to send OTP", "error");
      // }
    } catch (error) {
      showToast("Failed to proceed to verification", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (!formData.email.includes("@")) {
      showToast("Please enter a valid email", "error");
      return;
    }

    await sendOtp();
  };

  const handleVerification = async (otp: string) => {
    setLoading(true);
    try {
      // Call register API with user data
      const result = await registerUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        countryId: formData.countryId || undefined, // Send countryId if selected, otherwise undefined
      });

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
        showToast(authError, "error");
      } else {
        showToast("Registration failed", "error");
      }
    } catch (error) {
      showToast("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await sendOtp();
  };

  const handleBack = () => {
    if (step === "verification") {
      setStep("form");
    } else {
      router.back();
    }
  };

  const handleGoogleSignUp = () => {
    showToast("Google Sign Up - Coming Soon", "info");
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-20 px-4 sm:px-5 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 backdrop-blur-sm rounded-2xl mx-auto sm:mx-4 my-4 sm:my-8 max-w-md w-full">
        <Container maxWidth="sm" className="w-full">
          <Box className="w-full">
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
                      onChange={(e) =>
                        handleInputChange("countryId", e.target.value as string)
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
                      }}
                      MenuProps={{
                        disableScrollLock: true,
                        PaperProps: {
                          className: "dark:bg-gray-700 dark:text-white",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>{t("common.selectCountry")}</em>
                      </MenuItem>
                      {isLoadingCountries ? (
                        <MenuItem value="" disabled>
                          {t("common.loading")}
                        </MenuItem>
                      ) : (
                        countries.map((country) => (
                          <MenuItem key={country.id} value={country.id}>
                            {country.countryName}
                          </MenuItem>
                        ))
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
                  onClick={handleGoogleSignUp}
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
                      {t("auth.signInWithGoogle")}
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
                    © 2025 ALL RIGHTS RESERVED
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
            alt="register-bg"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
