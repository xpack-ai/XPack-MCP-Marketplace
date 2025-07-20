const STORAGE_KEY = "XPack_Shared";

const getUrlLanguage = (): string | null => {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang") || urlParams.get("locale");

  if (langParam && ["en", "zh-CN"].includes(langParam)) {
    return langParam;
  }

  return null;
};

const getBrowserDefaultLanguage = (): string => {
  if (typeof window === "undefined") {
    // SSR时根据Accept-Language header判断，这里先返回英语
    return "en";
  }

  const browserLang = navigator.language;
  const supportedLanguages: string[] = ["en", "zh-CN"];

  // 尝试完全匹配
  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }

  // 尝试匹配语言代码前缀（如 zh-CN 匹配 zh）
  const langPrefix = browserLang.split("-")[0];
  const match = supportedLanguages.find((lang) => lang.startsWith(langPrefix));

  return match || "en"; // 最后才fallback到英语
};

export const getDefaultLanguage = (): string => {
  // 1. 优先检查URL参数
  const urlLang = getUrlLanguage();
  if (urlLang) {
    return urlLang;
  }

  if (typeof window === "undefined") {
    return getBrowserDefaultLanguage();
  }

  try {
    // 2. 检查i18next的localStorage缓存
    const i18nextLng = localStorage.getItem("i18nextLng");
    if (i18nextLng && ["en", "zh-CN"].includes(i18nextLng)) {
      return i18nextLng;
    }

    // 3. 检查Zustand store中的语言设置
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw).state?.preference;
      if (parsed?.language && typeof parsed.language === "string") {
        return parsed.language;
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to parse language from localStorage", error);
  }

  // 4. 最后使用浏览器语言检测
  return getBrowserDefaultLanguage();
};
