import { FlexAlignment, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@monadiam/ui-kit";
import { JSX } from "react";

import { SigninForm } from "~features/authentication";

import { pageStyles } from "./styles";

export function SignIn(): JSX.Element {
    const { t } = useTranslation();
    const [parameters] = useSearchParams();
    const authorizationRequest = parameters.get("authorizationRequest");

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <title>{t("auth.signin")}</title>
                    <Text.H1>{t("auth.signin")}</Text.H1>
                    <Text.P tone={TextTone.MUTED}>{t("auth.signinDescription")}</Text.P>
                </header>
                <SigninForm authorizationRequest={authorizationRequest} />
                <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                    <Text.P>
                        {t("auth.noAccount")}{" "}
                        <Link
                            to={{
                                pathname: "/signup",
                                search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
                            }}>
                            {t("nav.signup")}
                        </Link>
                    </Text.P>
                </Flex.Col>
            </Flex.Col>
        </Flex.Col>
    );
}
