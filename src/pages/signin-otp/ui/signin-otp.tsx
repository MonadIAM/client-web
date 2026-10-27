import { FlexAlignment, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Container, Flex, Text } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { RequestCode, SigninOTPStep, SigninOTPAction, VerifyCode, useSigninOTP } from "~features/authentication";

import { pageStyles } from "./styles";

export function SigninOTP() {
    const { t } = useTranslation();
    const { state, dispatch } = useSigninOTP();
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
                    <title>{t(state.step === SigninOTPStep.VERIFICATION ? "otp.verifyTitle" : "otp.requestTitle")}</title>
                    <Text.H1>
                        {t(state.step === SigninOTPStep.VERIFICATION ? "otp.verifyTitle" : "otp.requestTitle")}
                    </Text.H1>
                    <Text.P tone={TextTone.MUTED}>
                        {t(state.step === SigninOTPStep.VERIFICATION ? "otp.verifyDescription" : "otp.requestDescription")}
                    </Text.P>
                </header>
                <Container render={<Flex.Col gap="1.25rem" />}>
                    {state.step === SigninOTPStep.VERIFICATION ? (
                        <VerifyCode
                            authorizationRequest={authorizationRequest}
                            onBack={() => dispatch({ type: SigninOTPAction.BACK })}
                        />
                    ) : (
                        <RequestCode
                            authorizationRequest={authorizationRequest}
                            identifier={state.identifier}
                            onContinue={(identifier) => dispatch({ type: SigninOTPAction.VERIFY, identifier })}
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
