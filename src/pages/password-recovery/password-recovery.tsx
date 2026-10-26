import { TextTone, FlexAlignment, FlexJustification } from "@monadiam/ui-kit/enums";
import { Text, Flex, Container } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { PasswordRecoveryStep } from "~src/enums";

import { RequestPassword } from "./components/request-password";
import { ResetPassword } from "./components/reset-password";
import { pageStyles } from "./styles";

export function PasswordRecovery() {
    const { t } = useTranslation();
    const [state, setState] = useState<PasswordRecovery.State>({
        step: PasswordRecoveryStep.REQUEST,
        identifier: "",
    });
    const [parameters] = useSearchParams();
    const request = parameters.get("authorizationRequest");
    const search = request ? `?${new URLSearchParams({ authorizationRequest: request })}` : "";
    const title =
        state.step === PasswordRecoveryStep.COMPLETE
            ? "complete"
            : state.step === PasswordRecoveryStep.REQUEST
              ? "title"
              : "confirmTitle";
    const description =
        state.step === PasswordRecoveryStep.COMPLETE
            ? "completeDescription"
            : state.step === PasswordRecoveryStep.REQUEST
              ? "description"
              : state.step === PasswordRecoveryStep.RECOVERY
                ? "recoveryDescription"
                : "confirmDescription";

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <title>{t(`passwordRecovery.${title}`)}</title>
                    <Text.H1>{t(`passwordRecovery.${title}`)}</Text.H1>
                    <Text.P
                        tone={TextTone.MUTED}
                        role={state.step === PasswordRecoveryStep.COMPLETE ? "status" : undefined}>
                        {t(`passwordRecovery.${description}`)}
                    </Text.P>
                </header>
                {state.step !== PasswordRecoveryStep.COMPLETE && (
                    <Container render={<Flex.Col gap="1.25rem" />}>
                        {state.step === PasswordRecoveryStep.REQUEST ? (
                            <RequestPassword
                                identifier={state.identifier}
                                onContinue={(identifier, step) => {
                                    setState({ step, identifier });
                                }}
                            />
                        ) : (
                            <ResetPassword
                                key={state.step}
                                identifier={state.identifier}
                                method={state.step}
                                onComplete={() => setState({ step: PasswordRecoveryStep.COMPLETE })}
                                onBack={(identifier) => {
                                    setState({ step: PasswordRecoveryStep.REQUEST, identifier });
                                }}
                            />
                        )}
                    </Container>
                )}
                <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Flex.Col>
            </Flex.Col>
        </Flex.Col>
    );
}
