import { LanguageSelect } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { Language } from "~src/enums";

export function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    return (
        <LanguageSelect
            label={t("common.language")}
            value={i18n.resolvedLanguage ?? Language.EN}
            options={[
                { value: Language.RU, label: "RU" },
                { value: Language.EN, label: "EN" },
            ]}
            onValueChange={(language) => {
                void i18n.changeLanguage(language);
            }}
        />
    );
}
