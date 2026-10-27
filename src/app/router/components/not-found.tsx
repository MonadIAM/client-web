import { ButtonVariant, FlexAlignment, FlexJustification, FlexWrap, TextSize } from "@monadiam/ui-kit/enums";
import { Button, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function NotFound({ rootPath }: Router.NotFoundProps): JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className={routerStyles.centered}>
            <Flex.Col align={FlexAlignment.CENTER} gap="1.25rem" className={routerStyles.error}>
                <title>{t("errors.notFound")}</title>
                <Text.H1>{t("errors.notFound")}</Text.H1>
                <Text.P size={TextSize.MD} role="status">
                    {t("errors.notFoundDescription")}
                </Text.P>
                <Flex.Row
                    wrap={FlexWrap.WRAP}
                    justify={FlexJustification.CENTER}
                    gap="0.75rem"
                    className={routerStyles.errorActions}>
                    <Button type="button" onClick={() => void navigate(rootPath)}>
                        {t("common.home")}
                    </Button>
                    <Button type="button" variant={ButtonVariant.OUTLINE} onClick={() => void navigate(-1)}>
                        {t("common.back")}
                    </Button>
                </Flex.Row>
            </Flex.Col>
        </section>
    );
}
