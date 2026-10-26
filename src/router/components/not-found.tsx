import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@monadiam/ui-kit";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function NotFound({ rootPath }: Router.NotFoundProps): JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className={routerStyles.centered}>
            <div className={routerStyles.error}>
                <h1 className={routerStyles.title}>{t("errors.notFound")}</h1>
                <p role="status">{t("errors.notFoundDescription")}</p>
                <div className={routerStyles.errorActions}>
                    <Button type="button" onClick={() => void navigate(rootPath)}>
                        {t("common.home")}
                    </Button>
                    <Button type="button" variant={ButtonVariant.OUTLINE} onClick={() => void navigate(-1)}>
                        {t("common.back")}
                    </Button>
                </div>
            </div>
        </section>
    );
}
