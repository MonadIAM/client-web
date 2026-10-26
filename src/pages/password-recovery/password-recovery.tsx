import { FlexAlignment, FlexJustification } from "@monadiam/ui-kit/enums";
import { Link, useSearchParams } from "react-router";
import { Flex, Container } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { PasswordRecoveryStep } from "~src/enums";

import { RequestPassword } from "./components/request-password";
import { ResetPassword } from "./components/reset-password";
import { pageStyles } from "./styles";

export function PasswordRecovery() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState("");
    const [complete, setComplete] = useState(false);
    const [parameters, setParameters] = useSearchParams();

    const requestedStep = parameters.get("step");
    const step = complete
        ? PasswordRecoveryStep.COMPLETE
        : requestedStep === PasswordRecoveryStep.OTP || requestedStep === PasswordRecoveryStep.RECOVERY
          ? requestedStep
          : PasswordRecoveryStep.REQUEST;
    const request = parameters.get("authorizationRequest");
    const search = request ? `?${new URLSearchParams({ authorizationRequest: request })}` : "";
    const title =
        step === PasswordRecoveryStep.COMPLETE
            ? "complete"
            : step === PasswordRecoveryStep.REQUEST
              ? "title"
              : "confirmTitle";
    const description =
        step === PasswordRecoveryStep.COMPLETE
            ? "completeDescription"
            : step === PasswordRecoveryStep.REQUEST
              ? "description"
              : step === PasswordRecoveryStep.RECOVERY
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
                    <h1 className={pageStyles.title}>{t(`passwordRecovery.${title}`)}</h1>
                    <p
                        className={pageStyles.description}
                        role={step === PasswordRecoveryStep.COMPLETE ? "status" : undefined}>
                        {t(`passwordRecovery.${description}`)}
                    </p>
                </header>
                {step !== PasswordRecoveryStep.COMPLETE && (
                    <Container render={<Flex.Col gap="1.25rem" />}>
                        {step === PasswordRecoveryStep.REQUEST ? (
                            <RequestPassword
                                identifier={identifier}
                                onIdentifierChange={setIdentifier}
                                onContinue={(identifier, step) => {
                                    setIdentifier(identifier);
                                    setParameters((current) => {
                                        const next = new URLSearchParams(current);
                                        next.set("step", step);
                                        return next;
                                    });
                                }}
                            />
                        ) : (
                            <ResetPassword
                                key={step}
                                identifier={identifier}
                                method={step}
                                onComplete={() => setComplete(true)}
                                onIdentifierChange={setIdentifier}
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
