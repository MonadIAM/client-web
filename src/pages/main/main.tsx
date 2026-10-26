import { useTranslation } from "react-i18next";

import { pageStyles } from "./styles";

export function Main() {
    const { t } = useTranslation();

    return (
        <section className={pageStyles.root}>
            <h1 className={pageStyles.title}>{t("main.title")}</h1>
            <p className={pageStyles.description}>{t("main.description")}</p>
        </section>
    );
}
