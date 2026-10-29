import { useTranslation } from "react-i18next";
import { Spinner } from "@monadiam/ui-kit";
import { JSX } from "react";

import { useNotificationTitle } from "~features/notification-preview";

import { routerStyles } from "../styles";

export function Loading(): JSX.Element {
    const { t } = useTranslation();
    const title = useNotificationTitle(t("common.loading"));

    return (
        <section className={routerStyles.centered}>
            <title>{title}</title>
            <Spinner aria-label={t("common.loading")} />
        </section>
    );
}
