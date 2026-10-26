import { TextSize, ButtonVariant, FlexAlignment } from "@monadiam/ui-kit/enums";
import { Text, Button, Flex } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function LoadError(): JSX.Element {
    const { t } = useTranslation();

    return (
        <section className={routerStyles.centered}>
            <Flex.Col align={FlexAlignment.CENTER} gap="1.25rem" className={routerStyles.error}>
                <Text.H1>MonadIAM</Text.H1>
                <Text.P size={TextSize.MD} role="alert">
                    {t("errors.load")}
                </Text.P>
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
