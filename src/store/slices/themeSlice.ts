import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: "system",
  isDark: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;

      if (action.payload === "system") {
        // Check system preference
        if (typeof window !== "undefined") {
          state.isDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
        }
      } else {
        state.isDark = action.payload === "dark";
      }
    },
    setSystemTheme: (state, action: PayloadAction<boolean>) => {
      if (state.mode === "system") {
        state.isDark = action.payload;
      }
    },
  },
});

export const { setThemeMode, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
