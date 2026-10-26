import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Button } from "@monadiam/ui-kit";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function LoadError(): JSX.Element {
    const { t } = useTranslation();

    return (
        <section className={routerStyles.centered}>
            <div className={routerStyles.error}>
                <h1 className={routerStyles.title}>MonadIAM</h1>
                <p role="alert">{t("errors.load")}</p>
                <Button
                    className={routerStyles.retry}
                    type="button"
                    variant={ButtonVariant.LINK}
                    onClick={() => location.reload()}>
                    {t("common.retry")}
                </Button>
            </div>
        </section>
    );
}
