import { FlexAlignment, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Container, Flex, Text } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { ResetSecondFactorForm } from "~features/authentication";

import { pageStyles } from "./styles";

export function ResetSecondFactor() {
    const { t } = useTranslation();
    const [parameters] = useSearchParams();
    const authorizationRequest = parameters.get("authorizationRequest");
    const search = authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "";

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <title>{t("resetSecondFactor.title")}</title>
                    <Text.H1>{t("resetSecondFactor.title")}</Text.H1>
                    <Text.P tone={TextTone.MUTED}>{t("resetSecondFactor.description")}</Text.P>
                </header>
                <Container render={<Flex.Col gap="1.25rem" />}>
                    <ResetSecondFactorForm search={search} />
                </Container>
                <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Flex.Col>
            </Flex.Col>
        </Flex.Col>
    );
}
