import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from "../lib/i18n.js";

interface LanguageContextType {
  uiLanguage: SupportedLanguage;
  setUiLanguage: (lang: SupportedLanguage) => void;
  aiLanguage: string;
  setAiLanguage: (lang: string) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLanguage, setUiLanguageState] = useState<SupportedLanguage>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("agrisage_ui_lang") as SupportedLanguage;
        return saved && ["en", "kn", "hi"].includes(saved) ? saved : "en";
      }
    } catch {}
    return "en";
  });

  const [aiLanguage, setAiLanguageState] = useState<string>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("agrisage_ai_lang") || "English";
      }
    } catch {}
    return "English";
  });

  const setUiLanguage = (lang: SupportedLanguage) => {
    setUiLanguageState(lang);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("agrisage_ui_lang", lang);
      }
    } catch {}
  };

  const setAiLanguage = (lang: string) => {
    setAiLanguageState(lang);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("agrisage_ai_lang", lang);
      }
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[uiLanguage] || translations.en;
    return (dict as Record<string, string>)[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        uiLanguage,
        setUiLanguage,
        aiLanguage,
        setAiLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
