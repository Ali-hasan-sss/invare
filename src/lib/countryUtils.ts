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
 * Country name translations - ISO 3166-1 alpha-2
 * Complete list of all countries with Arabic and English names
 */
export const countryNames: Record<string, { ar: string; en: string }> = {
  // A
  AF: { ar: "أفغانستان", en: "Afghanistan" },
  AL: { ar: "ألبانيا", en: "Albania" },
  DZ: { ar: "الجزائر", en: "Algeria" },
  AS: { ar: "ساموا الأمريكية", en: "American Samoa" },
  AD: { ar: "أندورا", en: "Andorra" },
  AO: { ar: "أنغولا", en: "Angola" },
  AI: { ar: "أنغويلا", en: "Anguilla" },
  AQ: { ar: "القارة القطبية الجنوبية", en: "Antarctica" },
  AG: { ar: "أنتيغوا وباربودا", en: "Antigua and Barbuda" },
  AR: { ar: "الأرجنتين", en: "Argentina" },
  AM: { ar: "أرمينيا", en: "Armenia" },
  AW: { ar: "أروبا", en: "Aruba" },
  AU: { ar: "أستراليا", en: "Australia" },
  AT: { ar: "النمسا", en: "Austria" },
  AZ: { ar: "أذربيجان", en: "Azerbaijan" },

  // B
  BS: { ar: "الباهاما", en: "Bahamas" },
  BH: { ar: "البحرين", en: "Bahrain" },
  BD: { ar: "بنغلاديش", en: "Bangladesh" },
  BB: { ar: "بربادوس", en: "Barbados" },
  BY: { ar: "بيلاروسيا", en: "Belarus" },
  BE: { ar: "بلجيكا", en: "Belgium" },
  BZ: { ar: "بليز", en: "Belize" },
  BJ: { ar: "بنين", en: "Benin" },
  BM: { ar: "برمودا", en: "Bermuda" },
  BT: { ar: "بوتان", en: "Bhutan" },
  BO: { ar: "بوليفيا", en: "Bolivia" },
  BA: { ar: "البوسنة والهرسك", en: "Bosnia and Herzegovina" },
  BW: { ar: "بوتسوانا", en: "Botswana" },
  BV: { ar: "جزيرة بوفيت", en: "Bouvet Island" },
  BR: { ar: "البرازيل", en: "Brazil" },
  IO: {
    ar: "الإقليم البريطاني في المحيط الهندي",
    en: "British Indian Ocean Territory",
  },
  BN: { ar: "بروناي", en: "Brunei" },
  BG: { ar: "بلغاريا", en: "Bulgaria" },
  BF: { ar: "بوركينا فاسو", en: "Burkina Faso" },
  BI: { ar: "بوروندي", en: "Burundi" },

  // C
  CV: { ar: "الرأس الأخضر", en: "Cape Verde" },
  KH: { ar: "كمبوديا", en: "Cambodia" },
  CM: { ar: "الكاميرون", en: "Cameroon" },
  CA: { ar: "كندا", en: "Canada" },
  KY: { ar: "جزر كايمان", en: "Cayman Islands" },
  CF: { ar: "جمهورية أفريقيا الوسطى", en: "Central African Republic" },
  TD: { ar: "تشاد", en: "Chad" },
  CL: { ar: "تشيلي", en: "Chile" },
  CN: { ar: "الصين", en: "China" },
  CX: { ar: "جزيرة الكريسماس", en: "Christmas Island" },
  CC: { ar: "جزر كوكوس", en: "Cocos Islands" },
  CO: { ar: "كولومبيا", en: "Colombia" },
  KM: { ar: "جزر القمر", en: "Comoros" },
  CG: { ar: "جمهورية الكونغو", en: "Congo" },
  CD: {
    ar: "جمهورية الكونغو الديمقراطية",
    en: "Democratic Republic of the Congo",
  },
  CK: { ar: "جزر كوك", en: "Cook Islands" },
  CR: { ar: "كوستاريكا", en: "Costa Rica" },
  CI: { ar: "ساحل العاج", en: "Ivory Coast" },
  HR: { ar: "كرواتيا", en: "Croatia" },
  CU: { ar: "كوبا", en: "Cuba" },
  CY: { ar: "قبرص", en: "Cyprus" },
  CZ: { ar: "جمهورية التشيك", en: "Czech Republic" },

  // D
  DK: { ar: "الدنمارك", en: "Denmark" },
  DJ: { ar: "جيبوتي", en: "Djibouti" },
  DM: { ar: "دومينيكا", en: "Dominica" },
  DO: { ar: "جمهورية الدومينيكان", en: "Dominican Republic" },

  // E
  EC: { ar: "الإكوادور", en: "Ecuador" },
  EG: { ar: "مصر", en: "Egypt" },
  SV: { ar: "السلفادور", en: "El Salvador" },
  GQ: { ar: "غينيا الاستوائية", en: "Equatorial Guinea" },
  ER: { ar: "إريتريا", en: "Eritrea" },
  EE: { ar: "إستونيا", en: "Estonia" },
  ET: { ar: "إثيوبيا", en: "Ethiopia" },

  // F
  FK: { ar: "جزر فوكلاند", en: "Falkland Islands" },
  FO: { ar: "جزر فارو", en: "Faroe Islands" },
  FJ: { ar: "فيجي", en: "Fiji" },
  FI: { ar: "فنلندا", en: "Finland" },
  FR: { ar: "فرنسا", en: "France" },
  GF: { ar: "غويانا الفرنسية", en: "French Guiana" },
  PF: { ar: "بولينيزيا الفرنسية", en: "French Polynesia" },
  TF: { ar: "الأراضي الفرنسية الجنوبية", en: "French Southern Territories" },

  // G
  GA: { ar: "الغابون", en: "Gabon" },
  GM: { ar: "غامبيا", en: "Gambia" },
  GE: { ar: "جورجيا", en: "Georgia" },
  DE: { ar: "ألمانيا", en: "Germany" },
  GH: { ar: "غانا", en: "Ghana" },
  GI: { ar: "جبل طارق", en: "Gibraltar" },
  GR: { ar: "اليونان", en: "Greece" },
  GL: { ar: "جرينلاند", en: "Greenland" },
  GD: { ar: "غرينادا", en: "Grenada" },
  GP: { ar: "جوادلوب", en: "Guadeloupe" },
  GU: { ar: "غوام", en: "Guam" },
  GT: { ar: "غواتيمالا", en: "Guatemala" },
  GG: { ar: "غيرنزي", en: "Guernsey" },
  GN: { ar: "غينيا", en: "Guinea" },
  GW: { ar: "غينيا بيساو", en: "Guinea-Bissau" },
  GY: { ar: "غيانا", en: "Guyana" },

  // H
  HT: { ar: "هايتي", en: "Haiti" },
  HM: {
    ar: "جزيرة هيرد وجزر ماكدونالد",
    en: "Heard Island and McDonald Islands",
  },
  HN: { ar: "هندوراس", en: "Honduras" },
  HK: { ar: "هونغ كونغ", en: "Hong Kong" },
  HU: { ar: "المجر", en: "Hungary" },

  // I
  IS: { ar: "آيسلندا", en: "Iceland" },
  IN: { ar: "الهند", en: "India" },
  ID: { ar: "إندونيسيا", en: "Indonesia" },
  IR: { ar: "إيران", en: "Iran" },
  IQ: { ar: "العراق", en: "Iraq" },
  IE: { ar: "أيرلندا", en: "Ireland" },
  IM: { ar: "جزيرة مان", en: "Isle of Man" },
  IL: { ar: "إسرائيل", en: "Israel" },
  IT: { ar: "إيطاليا", en: "Italy" },

  // J
  JM: { ar: "جامايكا", en: "Jamaica" },
  JP: { ar: "اليابان", en: "Japan" },
  JE: { ar: "جيرسي", en: "Jersey" },
  JO: { ar: "الأردن", en: "Jordan" },

  // K
  KZ: { ar: "كازاخستان", en: "Kazakhstan" },
  KE: { ar: "كينيا", en: "Kenya" },
  KI: { ar: "كيريباتي", en: "Kiribati" },
  KP: { ar: "كوريا الشمالية", en: "North Korea" },
  KR: { ar: "كوريا الجنوبية", en: "South Korea" },
  KW: { ar: "الكويت", en: "Kuwait" },
  KG: { ar: "قيرغيزستان", en: "Kyrgyzstan" },

  // L
  LA: { ar: "لاوس", en: "Laos" },
  LV: { ar: "لاتفيا", en: "Latvia" },
  LB: { ar: "لبنان", en: "Lebanon" },
  LS: { ar: "ليسوتو", en: "Lesotho" },
  LR: { ar: "ليبيريا", en: "Liberia" },
  LY: { ar: "ليبيا", en: "Libya" },
  LI: { ar: "ليختنشتاين", en: "Liechtenstein" },
  LT: { ar: "ليتوانيا", en: "Lithuania" },
  LU: { ar: "لوكسمبورغ", en: "Luxembourg" },

  // M
  MO: { ar: "ماكاو", en: "Macao" },
  MG: { ar: "مدغشقر", en: "Madagascar" },
  MW: { ar: "مالاوي", en: "Malawi" },
  MY: { ar: "ماليزيا", en: "Malaysia" },
  MV: { ar: "المالديف", en: "Maldives" },
  ML: { ar: "مالي", en: "Mali" },
  MT: { ar: "مالطا", en: "Malta" },
  MH: { ar: "جزر مارشال", en: "Marshall Islands" },
  MQ: { ar: "مارتينيك", en: "Martinique" },
  MR: { ar: "موريتانيا", en: "Mauritania" },
  MU: { ar: "موريشيوس", en: "Mauritius" },
  YT: { ar: "مايوت", en: "Mayotte" },
  MX: { ar: "المكسيك", en: "Mexico" },
  FM: { ar: "ميكرونيزيا", en: "Micronesia" },
  MD: { ar: "مولدوفا", en: "Moldova" },
  MC: { ar: "موناكو", en: "Monaco" },
  MN: { ar: "منغوليا", en: "Mongolia" },
  ME: { ar: "الجبل الأسود", en: "Montenegro" },
  MS: { ar: "مونتسيرات", en: "Montserrat" },
  MA: { ar: "المغرب", en: "Morocco" },
  MZ: { ar: "موزمبيق", en: "Mozambique" },
  MM: { ar: "ميانمار", en: "Myanmar" },

  // N
  NA: { ar: "ناميبيا", en: "Namibia" },
  NR: { ar: "ناورو", en: "Nauru" },
  NP: { ar: "نيبال", en: "Nepal" },
  NL: { ar: "هولندا", en: "Netherlands" },
  NC: { ar: "كاليدونيا الجديدة", en: "New Caledonia" },
  NZ: { ar: "نيوزيلندا", en: "New Zealand" },
  NI: { ar: "نيكاراغوا", en: "Nicaragua" },
  NE: { ar: "النيجر", en: "Niger" },
  NG: { ar: "نيجيريا", en: "Nigeria" },
  NU: { ar: "نيوي", en: "Niue" },
  NF: { ar: "جزيرة نورفولك", en: "Norfolk Island" },
  MK: { ar: "مقدونيا الشمالية", en: "North Macedonia" },
  MP: { ar: "جزر ماريانا الشمالية", en: "Northern Mariana Islands" },
  NO: { ar: "النرويج", en: "Norway" },

  // O
  OM: { ar: "عمان", en: "Oman" },

  // P
  PK: { ar: "باكستان", en: "Pakistan" },
  PW: { ar: "بالاو", en: "Palau" },
  PS: { ar: "فلسطين", en: "Palestine" },
  PA: { ar: "بنما", en: "Panama" },
  PG: { ar: "بابوا غينيا الجديدة", en: "Papua New Guinea" },
  PY: { ar: "باراغواي", en: "Paraguay" },
  PE: { ar: "بيرو", en: "Peru" },
  PH: { ar: "الفلبين", en: "Philippines" },
  PN: { ar: "جزر بيتكيرن", en: "Pitcairn" },
  PL: { ar: "بولندا", en: "Poland" },
  PT: { ar: "البرتغال", en: "Portugal" },
  PR: { ar: "بورتوريكو", en: "Puerto Rico" },

  // Q
  QA: { ar: "قطر", en: "Qatar" },

  // R
  RE: { ar: "لا ريونيون", en: "Réunion" },
  RO: { ar: "رومانيا", en: "Romania" },
  RU: { ar: "روسيا", en: "Russia" },
  RW: { ar: "رواندا", en: "Rwanda" },

  // S
  BL: { ar: "سان بارتليمي", en: "Saint Barthélemy" },
  SH: { ar: "سانت هيلينا", en: "Saint Helena" },
  KN: { ar: "سانت كيتس ونيفيس", en: "Saint Kitts and Nevis" },
  LC: { ar: "سانت لوسيا", en: "Saint Lucia" },
  MF: { ar: "سانت مارتن", en: "Saint Martin" },
  PM: { ar: "سانت بيير وميكلون", en: "Saint Pierre and Miquelon" },
  VC: { ar: "سانت فينسنت والغرينادين", en: "Saint Vincent and the Grenadines" },
  WS: { ar: "ساموا", en: "Samoa" },
  SM: { ar: "سان مارينو", en: "San Marino" },
  ST: { ar: "ساو تومي وبرينسيب", en: "São Tomé and Príncipe" },
  SA: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  SN: { ar: "السنغال", en: "Senegal" },
  RS: { ar: "صربيا", en: "Serbia" },
  SC: { ar: "سيشل", en: "Seychelles" },
  SL: { ar: "سيراليون", en: "Sierra Leone" },
  SG: { ar: "سنغافورة", en: "Singapore" },
  SX: { ar: "سينت مارتن", en: "Sint Maarten" },
  SK: { ar: "سلوفاكيا", en: "Slovakia" },
  SI: { ar: "سلوفينيا", en: "Slovenia" },
  SB: { ar: "جزر سليمان", en: "Solomon Islands" },
  SO: { ar: "الصومال", en: "Somalia" },
  ZA: { ar: "جنوب أفريقيا", en: "South Africa" },
  GS: {
    ar: "جورجيا الجنوبية وجزر ساندويتش الجنوبية",
    en: "South Georgia and the South Sandwich Islands",
  },
  SS: { ar: "جنوب السودان", en: "South Sudan" },
  ES: { ar: "إسبانيا", en: "Spain" },
  LK: { ar: "سريلانكا", en: "Sri Lanka" },
  SD: { ar: "السودان", en: "Sudan" },
  SR: { ar: "سورينام", en: "Suriname" },
  SJ: { ar: "سفالبارد ويان ماين", en: "Svalbard and Jan Mayen" },
  SE: { ar: "السويد", en: "Sweden" },
  CH: { ar: "سويسرا", en: "Switzerland" },
  SY: { ar: "سوريا", en: "Syria" },

  // T
  TW: { ar: "تايوان", en: "Taiwan" },
  TJ: { ar: "طاجيكستان", en: "Tajikistan" },
  TZ: { ar: "تنزانيا", en: "Tanzania" },
  TH: { ar: "تايلاند", en: "Thailand" },
  TL: { ar: "تيمور الشرقية", en: "Timor-Leste" },
  TG: { ar: "توغو", en: "Togo" },
  TK: { ar: "توكيلاو", en: "Tokelau" },
  TO: { ar: "تونغا", en: "Tonga" },
  TT: { ar: "ترينيداد وتوباغو", en: "Trinidad and Tobago" },
  TN: { ar: "تونس", en: "Tunisia" },
  TR: { ar: "تركيا", en: "Turkey" },
  TM: { ar: "تركمانستان", en: "Turkmenistan" },
  TC: { ar: "جزر تركس وكايكوس", en: "Turks and Caicos Islands" },
  TV: { ar: "توفالو", en: "Tuvalu" },

  // U
  UG: { ar: "أوغندا", en: "Uganda" },
  UA: { ar: "أوكرانيا", en: "Ukraine" },
  AE: { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  GB: { ar: "المملكة المتحدة", en: "United Kingdom" },
  UM: {
    ar: "جزر الولايات المتحدة الصغيرة النائية",
    en: "United States Minor Outlying Islands",
  },
  US: { ar: "الولايات المتحدة", en: "United States" },
  UY: { ar: "أوروغواي", en: "Uruguay" },
  UZ: { ar: "أوزبكستان", en: "Uzbekistan" },

  // V
  VU: { ar: "فانواتو", en: "Vanuatu" },
  VA: { ar: "الفاتيكان", en: "Vatican City" },
  VE: { ar: "فنزويلا", en: "Venezuela" },
  VN: { ar: "فيتنام", en: "Vietnam" },
  VG: { ar: "جزر العذراء البريطانية", en: "British Virgin Islands" },
  VI: { ar: "جزر العذراء الأمريكية", en: "U.S. Virgin Islands" },

  // W
  WF: { ar: "واليس وفوتونا", en: "Wallis and Futuna" },
  EH: { ar: "الصحراء الغربية", en: "Western Sahara" },

  // Y
  YE: { ar: "اليمن", en: "Yemen" },

  // Z
  ZM: { ar: "زامبيا", en: "Zambia" },
  ZW: { ar: "زيمبابوي", en: "Zimbabwe" },
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
