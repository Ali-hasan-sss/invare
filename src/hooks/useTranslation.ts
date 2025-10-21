import { useAppSelector } from "@/store/hooks";
import arTranslations from "@/locales/ar.json";
import enTranslations from "@/locales/en.json";

const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export const useTranslation = () => {
  const { currentLanguage } = useAppSelector((state) => state.language);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any =
      translations[currentLanguage.code as keyof typeof translations];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== "string") {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }

    if (typeof value !== "string") {
      return key; // Return key if translation not found
    }

    // Replace parameters in translation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }

    return value;
  };

  return { t, currentLanguage };
};
