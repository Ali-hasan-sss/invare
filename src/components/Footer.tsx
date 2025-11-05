"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import WhatsApp from "@mui/icons-material/WhatsApp";

const Footer: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = currentLanguage.dir === "rtl";

  const currentYear = new Date().getFullYear();

  // Scroll to section when hash is present in URL
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const sectionId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [pathname]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const sectionId = href.replace("/#", "");

      // If we're on the home page, scroll to the section
      if (pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState({}, "", href);
        }
      } else {
        // If we're on a different page, navigate to home page with hash
        router.push(href);
      }
    }
  };

  const footerLinks = {
    about: [
      { key: "aboutUs", href: "/#about-us" },
      { key: "ourMission", href: "/#mission" },
      // { key: "team", href: "/team" },
      // { key: "careers", href: "/careers" },
    ],
    services: [
      // { key: "auctions", href: "/auctions" },
      { key: "materials", href: "/materials" },
      { key: "listings", href: "/listings" },
      // { key: "pricing", href: "/pricing" },
    ],
    support: [
      { key: "helpCenter", href: "/help-center" },
      { key: "faq", href: "/faq" },
      { key: "contactUs", href: "/contact" },
      // { key: "terms", href: "/terms" },
    ],
    legal: [
      { key: "privacyPolicy", href: "/privacy" },
      { key: "termsOfService", href: "/terms" },
      { key: "refundPolicy", href: "/refund" },
    ],
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/invare_sa?igsh=MWc4OGFtZHU3c3Npdg==",
      ariaLabel: "Instagram",
    },
    {
      name: "whatsapp",
      icon: WhatsApp,
      href: "https://wa.me/+966532070220",
      ariaLabel: "Whatsapp",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-secondary-900 to-accent-900 dark:from-gray-950 dark:via-secondary-950 dark:to-accent-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                <span className="text-sm">{t("footer.address")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                <a
                  href="tel:+96812345678"
                  className="text-sm hover:text-secondary-400 transition-colors"
                >
                  {t("footer.phone")}
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-secondary-400 flex-shrink-0" />
                <a
                  href="mailto:info@invare.com"
                  className="text-sm hover:text-secondary-400 transition-colors"
                >
                  {t("footer.email")}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary-400">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-gray-300 hover:text-secondary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-0.5 bg-secondary-400 transition-all duration-200" />
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary-400">
              {t("footer.services")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-0.5 bg-secondary-400 transition-all duration-200" />
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-secondary-400">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.support.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1.5 h-0.5 bg-secondary-400 transition-all duration-200" />
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="font-semibold text-sm mb-3 text-secondary-400">
                {t("footer.followUs")}
              </h5>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="bg-gray-800 hover:bg-secondary-600 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={cn(
            "mt-12 pt-8 border-t border-gray-700",
            "flex flex-col md:flex-row items-center justify-between gap-4",
            isRTL ? "md:flex-row-reverse" : ""
          )}
        >
          {/* <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-secondary-400 transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-secondary-400 transition-colors"
            >
              {t("footer.termsOfService")}
            </Link>
          </div> */}
          <p className="text-sm text-gray-400">
            © {currentYear} {t("footer.companyName")}.{" "}
            {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
