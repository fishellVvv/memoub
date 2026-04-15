import { useEffect, useState } from "react";
import {
  clearStoredLocale,
  getLocaleMessages,
  readStoredLocale,
  readSystemLocale,
  writeStoredLocale,
  type Locale
} from "../lib/i18n";

export function useLocale() {
  const [localePreference, setLocalePreference] = useState<Locale | null>(() => readStoredLocale());
  const [systemLocale, setSystemLocale] = useState<Locale>(() => readSystemLocale());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleLanguageChange = () => {
      setSystemLocale(readSystemLocale());
    };

    window.addEventListener("languagechange", handleLanguageChange);
    return () => window.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  useEffect(() => {
    if (localePreference) {
      writeStoredLocale(localePreference);
      return;
    }

    clearStoredLocale();
  }, [localePreference]);

  const locale = localePreference ?? systemLocale;

  return {
    locale,
    setLocale: (nextLocale: Locale) => setLocalePreference(nextLocale),
    messages: getLocaleMessages(locale)
  };
}
