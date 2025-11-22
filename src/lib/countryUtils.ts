// Utility functions for country code to flag emoji and translations

/**
 * Converts a country code (ISO 3166-1 alpha-2) to a flag emoji
 * @param countryCode - Two-letter country code (e.g., "SA", "US", "GB")
 * @returns Flag emoji string
 */
export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) {
    return "🌍"; // Default globe emoji
  }

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

/**
 * Country name translations
 */
export const countryNames: Record<string, { ar: string; en: string }> = {
  DZ: { ar: "الجزائر", en: "Algeria" },
  BH: { ar: "البحرين", en: "Bahrain" },
  SA: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  AE: { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  IQ: { ar: "العراق", en: "Iraq" },
  JO: { ar: "الأردن", en: "Jordan" },
  KW: { ar: "الكويت", en: "Kuwait" },
  LB: { ar: "لبنان", en: "Lebanon" },
  LY: { ar: "ليبيا", en: "Libya" },
  MA: { ar: "المغرب", en: "Morocco" },
  OM: { ar: "عمان", en: "Oman" },
  PS: { ar: "فلسطين", en: "Palestine" },
  QA: { ar: "قطر", en: "Qatar" },
  SD: { ar: "السودان", en: "Sudan" },
  SY: { ar: "سوريا", en: "Syria" },
  TN: { ar: "تونس", en: "Tunisia" },
  YE: { ar: "اليمن", en: "Yemen" },
  EG: { ar: "مصر", en: "Egypt" },
  US: { ar: "الولايات المتحدة", en: "United States" },
  GB: { ar: "المملكة المتحدة", en: "United Kingdom" },
  FR: { ar: "فرنسا", en: "France" },
  DE: { ar: "ألمانيا", en: "Germany" },
  IT: { ar: "إيطاليا", en: "Italy" },
  ES: { ar: "إسبانيا", en: "Spain" },
  CN: { ar: "الصين", en: "China" },
  JP: { ar: "اليابان", en: "Japan" },
  IN: { ar: "الهند", en: "India" },
  BR: { ar: "البرازيل", en: "Brazil" },
  RU: { ar: "روسيا", en: "Russia" },
  TR: { ar: "تركيا", en: "Turkey" },
  IR: { ar: "إيران", en: "Iran" },
  PK: { ar: "باكستان", en: "Pakistan" },
  ID: { ar: "إندونيسيا", en: "Indonesia" },
  BD: { ar: "بنغلاديش", en: "Bangladesh" },
  NG: { ar: "نيجيريا", en: "Nigeria" },
  ET: { ar: "إثيوبيا", en: "Ethiopia" },
  PH: { ar: "الفلبين", en: "Philippines" },
  VN: { ar: "فيتنام", en: "Vietnam" },
  KR: { ar: "كوريا الجنوبية", en: "South Korea" },
  TH: { ar: "تايلاند", en: "Thailand" },
  MY: { ar: "ماليزيا", en: "Malaysia" },
  AU: { ar: "أستراليا", en: "Australia" },
  CA: { ar: "كندا", en: "Canada" },
  MX: { ar: "المكسيك", en: "Mexico" },
  AR: { ar: "الأرجنتين", en: "Argentina" },
  ZA: { ar: "جنوب أفريقيا", en: "South Africa" },
  NL: { ar: "هولندا", en: "Netherlands" },
  BE: { ar: "بلجيكا", en: "Belgium" },
  CH: { ar: "سويسرا", en: "Switzerland" },
  AT: { ar: "النمسا", en: "Austria" },
  SE: { ar: "السويد", en: "Sweden" },
  NO: { ar: "النرويج", en: "Norway" },
  DK: { ar: "الدنمارك", en: "Denmark" },
  FI: { ar: "فنلندا", en: "Finland" },
  PL: { ar: "بولندا", en: "Poland" },
  GR: { ar: "اليونان", en: "Greece" },
  PT: { ar: "البرتغال", en: "Portugal" },
  IE: { ar: "أيرلندا", en: "Ireland" },
  NZ: { ar: "نيوزيلندا", en: "New Zealand" },
  SG: { ar: "سنغافورة", en: "Singapore" },
  HK: { ar: "هونغ كونغ", en: "Hong Kong" },
};

/**
 * Get translated country name
 * @param countryCode - Two-letter country code
 * @param lang - Language code ("ar" or "en")
 * @returns Translated country name or original if not found
 */
export const getCountryName = (
  countryCode: string,
  lang: "ar" | "en" = "en"
): string => {
  const country = countryNames[countryCode?.toUpperCase()];
  if (country) {
    return country[lang];
  }
  // If translation not found, return empty string to use API name as fallback
  return "";
};
