import en from "./locales/en.json";
import "i18next";

declare module "i18next" {
    interface CustomTypeOptions {
        resources: {
            translation: typeof en;
        };
        defaultNS: "translation";
        strictKeyChecks: true;
    }
}
