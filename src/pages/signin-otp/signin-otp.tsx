import { TextTone, FlexAlignment, FlexJustification } from "@monadiam/ui-kit/enums";
import { Text, Flex, Container } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { RequestCode } from "./components/request-code";
import { VerifyCode } from "./components/verify-code";
import { pageStyles } from "./styles";

export function SigninOTP() {
    const { t } = useTranslation();
    const [parameters, setParameters] = useSearchParams();
    const [identifier, setIdentifier] = useState("");

    const authorizationRequest = parameters.get("authorizationRequest");
    const verifying = parameters.get("step") === "verify";
    const search = authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "";

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <Text.H1>{t(verifying ? "otp.verifyTitle" : "otp.requestTitle")}</Text.H1>
                    <Text.P tone={TextTone.MUTED}>
                        {t(verifying ? "otp.verifyDescription" : "otp.requestDescription")}
                    </Text.P>
                </header>
                <Container render={<Flex.Col gap="1.25rem" />}>
                    {verifying ? (
                        <VerifyCode authorizationRequest={authorizationRequest} />
                    ) : (
                        <RequestCode
                            authorizationRequest={authorizationRequest}
                            identifier={identifier}
                            onRequested={(value) => {
                                setIdentifier(value);
                                setParameters((current) => {
                                    const next = new URLSearchParams(current);
                                    next.set("step", "verify");
                                    return next;
                                });
                            }}
                        />
                    )}
                    {!authorizationRequest && <Text.P tone={TextTone.MUTED}>{t("auth.requestMissing")}</Text.P>}
                </Container>
                <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Flex.Col>
            </Flex.Col>
        </Flex.Col>
    );
}
