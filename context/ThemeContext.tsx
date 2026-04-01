import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import colors, { ThemeName, ThemeColors, themeNames } from "@/constants/colors";

interface ThemeContextValue {
  themeName: ThemeName;
  theme: ThemeColors;
  setTheme: (name: ThemeName) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: "Earth",
  theme: colors.themes.Earth,
  setTheme: () => {},
  particlesEnabled: true,
  setParticlesEnabled: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("Earth");
  const [particlesEnabled, setParticlesEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["@cp_theme", "@cp_particles"]).then((values) => {
      const savedTheme = values[0][1];
      const savedParticles = values[1][1];
      if (savedTheme && themeNames.includes(savedTheme as ThemeName)) {
        setThemeName(savedTheme as ThemeName);
      }
      if (savedParticles !== null) {
        setParticlesEnabledState(savedParticles === "true");
      }
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem("@cp_theme", name);
  }, []);

  const setParticlesEnabled = useCallback((v: boolean) => {
    setParticlesEnabledState(v);
    AsyncStorage.setItem("@cp_particles", String(v));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: colors.themes[themeName],
        setTheme,
        particlesEnabled,
        setParticlesEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
