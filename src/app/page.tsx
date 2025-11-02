"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Recycle,
  Shield,
  Users,
  Award,
  TrendingUp,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Package,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import { useListings } from "@/hooks/useListings";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { ListingFormDialog } from "@/components/ListingFormDialog";
import { AdvertisementFormDialog } from "@/components/admin/AdvertisementFormDialog";
import { CreateListingData } from "@/store/slices/listingsSlice";
import { CreateAdvertisementData } from "@/store/slices/advertisementsSlice";

export default function HomePage() {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { advertisements, fetchAdvertisements, addAdvertisement } =
    useAdvertisements();
  const { createListing } = useListings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showAdvertisementForm, setShowAdvertisementForm] = useState(false);
  const isRTL = currentLanguage.dir === "rtl";

  useEffect(() => {
    // Fetch active advertisements only
    fetchAdvertisements(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (advertisements.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === advertisements.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [advertisements.length]);

  const handlePostListing = () => {
    if (!isAuthenticated) {
      showToast(t("home.loginRequired"), "warning");
      router.push("/auth/login");
      return;
    }
    // Open listing form dialog
    setShowListingForm(true);
  };

  const handleSubmitListing = async (listingData: CreateListingData) => {
    try {
      const result = await createListing(listingData);

      // Check if the result is fulfilled
      if (result && "type" in result && result.type.includes("/fulfilled")) {
        showToast(t("listing.listingCreatedSuccess"), "success");
        setShowListingForm(false);
      } else {
        showToast(t("listing.listingCreatedError"), "error");
      }
    } catch (error) {
      showToast(t("listing.listingCreatedError"), "error");
    }
  };

  const handleAddAdvertisement = () => {
    if (!isAuthenticated) {
      showToast(t("home.loginRequired"), "warning");
      router.push("/auth/login");
      return;
    }
    // Open advertisement form dialog
    setShowAdvertisementForm(true);
  };

  const handleSubmitAdvertisement = async (
    advertisementData: CreateAdvertisementData
  ) => {
    try {
      const result = await addAdvertisement(advertisementData);

      // Check if the result is fulfilled
      if (result && "type" in result && result.type.includes("/fulfilled")) {
        showToast(t("advertisement.advertisementCreatedSuccess"), "success");
        setShowAdvertisementForm(false);
        // Refresh advertisements
        fetchAdvertisements(true);
      } else {
        showToast(t("advertisement.advertisementCreatedError"), "error");
      }
    } catch (error) {
      showToast(t("advertisement.advertisementCreatedError"), "error");
    }
  };

  const handleStartBidding = () => {
    router.push("/listings");
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push("/auth/register");
    } else {
      router.push("/listings");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === advertisements.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? advertisements.length - 1 : prev - 1
    );
  };

  const services = [
    {
      icon: Gavel,
      title: t("home.service1Title"),
      description: t("home.service1Description"),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Award,
      title: t("home.service2Title"),
      description: t("home.service2Description"),
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: t("home.service3Title"),
      description: t("home.service3Description"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      title: t("home.service4Title"),
      description: t("home.service4Description"),
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: HeadphonesIcon,
      title: t("home.service5Title"),
      description: t("home.service5Description"),
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: TrendingUp,
      title: t("home.service6Title"),
      description: t("home.service6Description"),
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const stats = [
    { value: "5,000+", label: t("home.statsUsers"), icon: Users },
    { value: "10,000+", label: t("home.statsListings"), icon: Package },
    { value: "15,000+", label: t("home.statsDeals"), icon: CheckCircle2 },
    { value: "98%", label: t("home.statsSatisfaction"), icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div
              className={cn(
                "text-white",
                isRTL ? "lg:text-right" : "lg:text-left"
              )}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Recycle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t("home.whyChooseUs")}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("home.heroTitle")}
              </h1>

              <p className="text-xl md:text-2xl mb-4 text-blue-100">
                {t("home.heroSubtitle")}
              </p>

              <p className="text-lg mb-8 text-blue-200">
                {t("home.heroDescription")}
              </p>

              <div
                className={cn(
                  "flex flex-wrap gap-4",
                  isRTL ? "justify-end" : "justify-start"
                )}
              >
                <Button
                  onClick={handleStartBidding}
                  size="lg"
                  className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <Gavel className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                  {t("home.startBidding")}
                </Button>

                <Button
                  onClick={handlePostListing}
                  size="lg"
                  variant="secondary"
                  className="!bg-blue-500/20 !text-white border-2 border-white/30 hover:!bg-blue-500/30 backdrop-blur-sm font-semibold"
                >
                  <Package className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                  {t("home.postListing")}
                </Button>
              </div>
            </div>

            {/* Hero Image / Illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="aspect-square relative">
                  <Image
                    src="/images/logo.png"
                    alt="Recycling"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="currentColor"
              className="text-gray-50 dark:text-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Advertisements Slider */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.featuredAds")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
          </div>

          {advertisements.length > 0 ? (
            <div className="relative max-w-5xl mx-auto">
              {/* Slider Container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(${
                      isRTL ? currentSlide * 100 : -currentSlide * 100
                    }%)`,
                  }}
                >
                  {advertisements.map((ad) => (
                    <div key={ad.id} className="min-w-full">
                      <div className="relative aspect-[16/9] bg-gray-900">
                        <img
                          src={ad.imageUrl}
                          alt={ad.listing?.title || "Advertisement"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Ad Info */}
                        <div
                          className={cn(
                            "absolute bottom-0 left-0 right-0 p-8 text-white",
                            isRTL ? "text-right" : "text-left"
                          )}
                        >
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">
                            {ad.listing?.title || "Featured Listing"}
                          </h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg font-semibold text-blue-200">
                              {t("common.currency")}{" "}
                              {ad.listing?.startingPrice || "N/A"}
                            </span>
                            {ad.listing?.isBiddable && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-medium rounded-full border border-yellow-500/30">
                                {t("listings.auction")}
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              if (ad.listing?.id) {
                                router.push(
                                  `/listings/detail/${ad.listing.id}`
                                );
                              }
                            }}
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 font-semibold"
                          >
                            {t("home.viewListing")}
                            <ArrowRight
                              className={cn(
                                "h-4 w-4",
                                isRTL ? "mr-2 rotate-180" : "ml-2"
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {advertisements.length > 1 && (
                <>
                  <button
                    onClick={isRTL ? nextSlide : prevSlide}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all",
                      isRTL ? "right-4" : "left-4"
                    )}
                  >
                    {isRTL ? (
                      <ChevronRight className="h-6 w-6" />
                    ) : (
                      <ChevronLeft className="h-6 w-6" />
                    )}
                  </button>
                  <button
                    onClick={isRTL ? prevSlide : nextSlide}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all",
                      isRTL ? "left-4" : "right-4"
                    )}
                  >
                    {isRTL ? (
                      <ChevronLeft className="h-6 w-6" />
                    ) : (
                      <ChevronRight className="h-6 w-6" />
                    )}
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {advertisements.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {advertisements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        currentSlide === index
                          ? "bg-blue-600 w-8"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t("advertisement.noAdvertisements")}
              </p>
            </div>
          )}

          {/* Add Advertisement Button */}
          <div className="text-center mt-8">
            <Button
              onClick={handleAddAdvertisement}
              size="lg"
              className="!bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 !text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Package className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
              {t("advertisement.addAdvertisement")}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("home.servicesTitle")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("home.servicesSubtitle")}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "inline-flex p-4 rounded-xl bg-gradient-to-br mb-6 shadow-lg group-hover:shadow-xl transition-shadow",
                    service.color
                  )}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {service.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              {t("home.ctaSubtitle")}
            </p>
            <p className="text-lg mb-10 text-blue-200 max-w-2xl mx-auto">
              {t("home.ctaDescription")}
            </p>

            <div className={cn("flex flex-wrap gap-4", "justify-center")}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="!bg-white !text-blue-700 hover:!bg-blue-50 font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                {t("home.getStarted")}
                <ArrowRight
                  className={cn("h-5 w-5", isRTL ? "mr-2 rotate-180" : "ml-2")}
                />
              </Button>

              <Button
                onClick={() => router.push("/contact")}
                size="lg"
                variant="secondary"
                className="!bg-transparent border-2 border-white !text-white hover:!bg-white/10 backdrop-blur-sm font-semibold text-lg px-8 py-6"
              >
                {t("home.contactUs")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Listing Form Dialog */}
      <ListingFormDialog
        open={showListingForm}
        onClose={() => setShowListingForm(false)}
        onSubmit={handleSubmitListing}
      />

      {/* Advertisement Form Dialog */}
      <AdvertisementFormDialog
        open={showAdvertisementForm}
        advertisement={null}
        onClose={() => setShowAdvertisementForm(false)}
        onSubmit={handleSubmitAdvertisement}
      />
    </div>
  );
}
