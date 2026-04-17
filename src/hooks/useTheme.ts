import { useEffect, useState } from "react";
import {
  CUSTOM_THEME_STORAGE_KEY,
  DEFAULT_CUSTOM_THEME_PREFERENCE,
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  applyThemeTokens,
  listPresetThemes,
  readStoredCustomTheme,
  readSystemColorScheme,
  readStoredTheme,
  resolveThemeBase,
  resolveThemePreference,
  resolveThemeMode,
  resolveThemeTokens,
  writeStoredCustomTheme,
  writeStoredTheme,
  type ThemeId,
  type ThemeOverrides,
  type ThemePreference
} from "../lib/theme";

export function useTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    () => readStoredTheme() ?? DEFAULT_THEME_PREFERENCE
  );
  const [customThemePreference, setCustomThemePreference] = useState<Extract<ThemePreference, { kind: "custom" }>>(
    () => readStoredCustomTheme() ?? DEFAULT_CUSTOM_THEME_PREFERENCE
  );
  const [systemColorScheme, setSystemColorScheme] = useState<"light" | "dark">(() => readSystemColorScheme());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemColorScheme(event.matches ? "dark" : "light");
    };

    setSystemColorScheme(mediaQuery.matches ? "dark" : "light");

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const tokens = resolveThemeTokens(themePreference, systemColorScheme);
    const resolvedPreference = resolveThemePreference(themePreference, systemColorScheme);
    applyThemeTokens(tokens);
    document.documentElement.style.colorScheme = resolveThemeMode(themePreference, systemColorScheme);
    document.documentElement.dataset.theme =
      themePreference.kind === "system"
        ? `system-${resolvedPreference.kind === "preset" ? resolvedPreference.themeId : resolvedPreference.baseThemeId}`
        : themePreference.kind === "preset"
          ? themePreference.themeId
          : `${themePreference.baseThemeId}-custom`;
    writeStoredTheme(themePreference);
  }, [systemColorScheme, themePreference]);

  useEffect(() => {
    writeStoredCustomTheme(customThemePreference);
  }, [customThemePreference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        setThemePreference(readStoredTheme() ?? DEFAULT_THEME_PREFERENCE);
      }

      if (event.key === CUSTOM_THEME_STORAGE_KEY) {
        setCustomThemePreference(readStoredCustomTheme() ?? DEFAULT_CUSTOM_THEME_PREFERENCE);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setPresetTheme = (themeId: ThemeId) => {
    setThemePreference({
      kind: "preset",
      themeId
    });
  };

  const setSystemTheme = () => {
    setThemePreference({
      kind: "system"
    });
  };

  const setCustomTheme = (overrides: ThemeOverrides, baseThemeId: ThemeId = "paper") => {
    const nextPreference: Extract<ThemePreference, { kind: "custom" }> = {
      kind: "custom",
      baseThemeId,
      overrides
    };

    setCustomThemePreference(nextPreference);
    setThemePreference(nextPreference);
  };

  const resetTheme = () => {
    setThemePreference(DEFAULT_THEME_PREFERENCE);
  };

  const activeThemeId =
    themePreference.kind === "preset" ? themePreference.themeId : themePreference.kind === "custom" ? themePreference.baseThemeId : null;
  const customThemeActive = themePreference.kind === "custom";
  const systemThemeActive = themePreference.kind === "system";
  const resolvedThemeTokens = resolveThemeTokens(themePreference, systemColorScheme);

  return {
    themePreference,
    customThemePreference,
    activeThemeId,
    customThemeActive,
    systemThemeActive,
    systemColorScheme,
    resolvedThemeTokens,
    presetThemes: listPresetThemes(),
    setSystemTheme,
    setPresetTheme,
    setCustomTheme,
    resetTheme
  };
}
