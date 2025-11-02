import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Language {
  code: string;
  name: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export interface LanguageState {
  currentLanguage: Language;
  availableLanguages: Language[];
}

// Default language (always Arabic for SSR)
const defaultLanguage: Language = {
  code: "ar",
  name: "العربية",
  flag: "🇸🇦",
  dir: "rtl",
};

// Get saved language from localStorage or default to Arabic
const getInitialLanguage = (): Language => {
  // Always return default for SSR
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const savedLanguage = localStorage.getItem("selected-language");
  if (savedLanguage) {
    try {
      return JSON.parse(savedLanguage);
    } catch (e) {
      console.error("Error parsing saved language:", e);
    }
  }

  return defaultLanguage;
};

const initialState: LanguageState = {
  currentLanguage: getInitialLanguage(),
  availableLanguages: [
    {
      code: "ar",
      name: "العربية",
      flag: "🇸🇦",
      dir: "rtl",
    },
    {
      code: "en",
      name: "English",
      flag: "🇬🇧",
      dir: "ltr",
    },
  ],
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      const language = state.availableLanguages.find(
        (lang) => lang.code === action.payload
      );
      if (language) {
        state.currentLanguage = language;
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("selected-language", JSON.stringify(language));
        }
        // Update document direction
        if (typeof document !== "undefined") {
          document.documentElement.dir = language.dir;
          document.documentElement.lang = language.code;
        }
      }
    },
    addLanguage: (state, action: PayloadAction<Language>) => {
      const existingLanguage = state.availableLanguages.find(
        (lang) => lang.code === action.payload.code
      );
      if (!existingLanguage) {
        state.availableLanguages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      state.availableLanguages = state.availableLanguages.filter(
        (lang) => lang.code !== action.payload
      );
      // If current language is being removed, switch to default
      if (state.currentLanguage.code === action.payload) {
        state.currentLanguage =
          state.availableLanguages[0] || initialState.currentLanguage;
      }
    },
  },
});

export const { setLanguage, addLanguage, removeLanguage } =
  languageSlice.actions;
export default languageSlice.reducer;
