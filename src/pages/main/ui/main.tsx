import { TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Text } from "@monadiam/ui-kit";

import { useNotificationTitle } from "~features/notification-preview";

import { pageStyles } from "./styles";

export function Main() {
    const { t } = useTranslation();
    const title = useNotificationTitle(t("main.title"));

    return (
        <section className={pageStyles.root}>
            <title>{title}</title>
            <Text.H1>{t("main.title")}</Text.H1>
            <Text.P tone={TextTone.MUTED}>{t("main.description")}</Text.P>
        </section>
    );
}
