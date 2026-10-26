import { ButtonVariant, FlexAlignment } from "@monadiam/ui-kit/enums";
import { Button, Flex } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function LoadError(): JSX.Element {
    const { t } = useTranslation();

    return (
        <section className={routerStyles.centered}>
            <Flex.Col align={FlexAlignment.CENTER} gap="1.25rem" className={routerStyles.error}>
                <h1 className={routerStyles.title}>MonadIAM</h1>
                <p role="alert">{t("errors.load")}</p>
                <Button
                    className={routerStyles.retry}
                    type="button"
                    variant={ButtonVariant.LINK}
                    onClick={() => location.reload()}>
                    {t("common.retry")}
                </Button>
            </Flex.Col>
        </section>
    );
}
