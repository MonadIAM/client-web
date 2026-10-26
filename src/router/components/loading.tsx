import { useTranslation } from "react-i18next";
import { Spinner } from "@monadiam/ui-kit";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function Loading(): JSX.Element {
    const { t } = useTranslation();

    return (
        <section className={routerStyles.centered}>
            <title>{t("common.loading")}</title>
            <Spinner aria-label={t("common.loading")} />
        </section>
    );
}
