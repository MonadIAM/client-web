import { TextTone, FlexAlignment, FlexJustification } from "@monadiam/ui-kit/enums";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Text, Flex, Container, Button } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useState, Fragment } from "react";

import { SignupStep } from "~src/enums";

import { SaveRecoveryCodes } from "./components/save-recovery-codes";
import { Registration } from "./components/registration";
import { Verification } from "./components/verification";
import { pageStyles } from "./styles";

export function SignUp() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [state, setState] = useState<Signup.State>({
        step: SignupStep.REGISTRATION,
        identifier: "",
    });
    const [parameters] = useSearchParams();
    const request = parameters.get("authorizationRequest");
    const search = request ? `?${new URLSearchParams({ authorizationRequest: request })}` : "";
    const title =
        state.step === SignupStep.REGISTRATION
            ? t("auth.signupTitle")
            : state.step === SignupStep.VERIFICATION
              ? t("auth.verifyTitle")
              : t("auth.verified");

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <title>{title}</title>
                    <Text.H1>{title}</Text.H1>
                    {state.step === SignupStep.REGISTRATION && (
                        <Text.P tone={TextTone.MUTED}>{t("auth.signupDescription")}</Text.P>
                    )}
                </header>
                <Container render={<Flex.Col gap="1.25rem" />}>
                    {state.step === SignupStep.REGISTRATION ? (
                        <Registration
                            identifier={state.identifier}
                            onContinue={(identifier) => {
                                setState({ step: SignupStep.VERIFICATION, identifier });
                            }}
                        />
                    ) : state.step === SignupStep.VERIFICATION ? (
                        <Verification
                            identifier={state.identifier}
                            onVerified={(codes) => {
                                setState({ step: SignupStep.RECOVERY, codes });
                            }}
                        />
                    ) : (
                        <SaveRecoveryCodes
                            codes={state.codes}
                            onComplete={() => {
                                void navigate({ pathname: "/signin", search }, { replace: true });
                            }}
                        />
                    )}
                </Container>
                {state.step !== SignupStep.RECOVERY && (
                    <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                        {state.step === SignupStep.VERIFICATION && (
                            <Button.Link
                                onClick={() => setState({ step: SignupStep.REGISTRATION, identifier: state.identifier })}>
                                {t("auth.backToSignup")}
                            </Button.Link>
                        )}
                        <Text.P>
                            {state.step === SignupStep.REGISTRATION && <Fragment>{t("auth.hasAccount")} </Fragment>}
                            <Link to={{ pathname: "/signin", search }}>
                                {state.step === SignupStep.REGISTRATION ? t("nav.signin") : t("auth.continue")}
                            </Link>
                        </Text.P>
                    </Flex.Col>
                )}
            </Flex.Col>
        </Flex.Col>
    );
}
