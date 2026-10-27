import LanguageDetector from "i18next-browser-languagedetector";
import { en as zodEn, ru as zodRu } from "zod/locales";
import { initReactI18next } from "react-i18next";
import { createInstance } from "i18next";
import { config } from "zod";

import { Language } from "~shared/i18n/enums";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

export const i18n = createInstance();
export const languageStorageKey = "monadiam.language";

i18n.on("languageChanged", () => {
    document.documentElement.lang = i18n.resolvedLanguage ?? Language.EN;
    config((i18n.resolvedLanguage === Language.RU ? zodRu : zodEn)());
});

window.addEventListener("storage", (event) => {
    if (
        event.key === languageStorageKey &&
        (event.newValue === Language.RU || event.newValue === Language.EN) &&
        event.newValue !== i18n.resolvedLanguage
    ) {
        void i18n.changeLanguage(event.newValue);
    }
});

export const localization = i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { [Language.EN]: { translation: en }, [Language.RU]: { translation: ru satisfies typeof en } },
        supportedLngs: [Language.RU, Language.EN],
        fallbackLng: Language.EN,
        load: "languageOnly",
        interpolation: { escapeValue: false },
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: languageStorageKey,
            caches: ["localStorage"],
            convertDetectedLanguage: (language) =>
                language.toLowerCase().split("-")[0] === Language.RU ? Language.RU : Language.EN,
        },
    });
