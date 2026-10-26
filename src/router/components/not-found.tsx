import { FlexJustification, FlexWrap, ButtonVariant, FlexAlignment } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Flex, Button } from "@monadiam/ui-kit";
import { JSX } from "react";

import { routerStyles } from "../styles";

export function NotFound({ rootPath }: Router.NotFoundProps): JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className={routerStyles.centered}>
            <Flex.Col align={FlexAlignment.CENTER} gap="1.25rem" className={routerStyles.error}>
                <h1 className={routerStyles.title}>{t("errors.notFound")}</h1>
                <p role="status">{t("errors.notFoundDescription")}</p>
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
