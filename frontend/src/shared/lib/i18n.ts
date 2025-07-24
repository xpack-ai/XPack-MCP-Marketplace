import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { getDefaultLanguage } from "@/shared/utils/i18n";
let resources = {};
if(typeof window !== "undefined" && !window._BACKEND_LOAD_LANG__){
  let en=require("../../../public/locales/en/translation.json");
  let enConfig=require("../../../public/locales/en/config.json");
  let zhCN=require("../../../public/locales/zh-CN/translation.json");
  let zhCNConfig=require("../../../public/locales/zh-CN/config.json");
  resources = {
    en: { translation: en, config: enConfig },
    "zh-CN": { translation: zhCN, config: zhCNConfig },
  };
}

// Try to read the preferred language from multiple sources:
// 1. URL parameters (lang=zh-CN)
// 2. localStorage (both i18next and XPack_Shared)
// 3. Browser language
// Falls back to browser language detection without hardcoding defaults

const DEFAULT_LANGUAGE = getDefaultLanguage();

const SUPPORTED_LANGUAGES = [
  { name: "en", label: "English" },
  { name: "zh-CN", label: "中文" },
];
export const i18nPromise = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...(typeof window !== "undefined" && window._BACKEND_LOAD_LANG__
      ? {
          backend: {
            // Allow loading multiple namespaces (e.g. translation.json, config.json)
            loadPath: `${process.env.NEXT_PUBLIC_STATIC_URL_PREFIX || ""}/locales/{{lng}}/{{ns}}.json`,
            // add request options to improve loading speed
            requestOptions: {
              cache: "default",
            },
          },
        }
      : {
          resources,
        }),
    ns: ["translation", "config"],
    defaultNS: "translation",
    fallbackNS: "config",
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE, // use dynamically detected language as fallback
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.name),

    // preload resources to reduce switching delay
    preload: SUPPORTED_LANGUAGES.map((lang) => lang.name),

    interpolation: {
      escapeValue: false,
    },
    detection: {
      // optimize detection order, prioritize localStorage
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng", // use standard i18next localStorage key
    },
    react: {
      useSuspense: false, // Important for Next.js SSR
      bindI18n: "languageChanged loaded", // bind more events to ensure timely update
      bindI18nStore: "added removed",
    },

    // debug config (can be closed in production)
    debug: false,
  });

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
export default i18n;
