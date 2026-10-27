import { TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Text } from "@monadiam/ui-kit";

import { pageStyles } from "./styles";

export function Main() {
    const { t } = useTranslation();

    return (
        <section className={pageStyles.root}>
            <title>{t("main.title")}</title>
            <Text.H1>{t("main.title")}</Text.H1>
            <Text.P tone={TextTone.MUTED}>{t("main.description")}</Text.P>
        </section>
    );
}
