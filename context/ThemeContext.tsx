import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import colors, { ThemeName, ThemeColors, themeNames } from "@/constants/colors";

interface ThemeContextValue {
  themeName: ThemeName;
  theme: ThemeColors;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: "Earth",
  theme: colors.themes.Earth,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("Earth");

  useEffect(() => {
    AsyncStorage.getItem("@cp_theme").then((savedTheme) => {
      if (savedTheme && themeNames.includes(savedTheme as ThemeName)) {
        setThemeName(savedTheme as ThemeName);
      }
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem("@cp_theme", name);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: colors.themes[themeName],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
