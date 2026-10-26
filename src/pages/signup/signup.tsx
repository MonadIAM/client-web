import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { SignupStep } from "~src/enums";

import { SaveRecoveryCodes } from "./components/save-recovery-codes";
import { Registration } from "./components/registration";
import { Verification } from "./components/verification";
import { pageStyles } from "./styles";

export function SignUp() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [codes, setCodes] = useState<string[]>();
    const [parameters, setParameters] = useSearchParams();

    const step = codes
        ? SignupStep.RECOVERY
        : parameters.get("step") === SignupStep.VERIFICATION
          ? SignupStep.VERIFICATION
          : SignupStep.REGISTRATION;
    const registrationSearch = new URLSearchParams(parameters);
    registrationSearch.delete("step");
    const request = parameters.get("authorizationRequest");
    const search = request ? `?${new URLSearchParams({ authorizationRequest: request })}` : "";
    const title =
        step === SignupStep.REGISTRATION
            ? t("auth.signupTitle")
            : step === SignupStep.VERIFICATION
              ? t("auth.verifyTitle")
              : t("auth.verified");

    return (
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{title}</h1>
                    {step === SignupStep.REGISTRATION && (
                        <p className={pageStyles.description}>{t("auth.signupDescription")}</p>
                    )}
                </header>
                <div className={pageStyles.panel}>
                    {step === SignupStep.REGISTRATION ? (
                        <Registration
                            onIdentifierChange={setIdentifier}
                            onCreated={(identifier) => {
                                setIdentifier(identifier);
                                setParameters((current) => {
                                    const next = new URLSearchParams(current);
                                    next.set("step", SignupStep.VERIFICATION);
                                    return next;
                                });
                            }}
                        />
                    ) : step === SignupStep.VERIFICATION ? (
                        <Verification
                            identifier={identifier}
                            onVerified={(codes) => {
                                setCodes(codes);
                                setIdentifier("");
                                setParameters(registrationSearch, { replace: true });
                            }}
                        />
                    ) : (
                        codes && (
                            <SaveRecoveryCodes
                                codes={codes}
                                onComplete={() => {
                                    setCodes(undefined);
                                    void navigate({ pathname: "/signin", search }, { replace: true });
                                }}
                            />
                        )
                    )}
                </div>
                {step !== SignupStep.RECOVERY && (
                    <footer className={pageStyles.footer}>
                        {step === SignupStep.VERIFICATION && (
                            <Link to={{ search: `?${registrationSearch}` }}>{t("auth.backToSignup")}</Link>
                        )}
                        <span>
                            {step === SignupStep.REGISTRATION && <>{t("auth.hasAccount")} </>}
                            <Link to={{ pathname: "/signin", search }}>
                                {step === SignupStep.REGISTRATION ? t("nav.signin") : t("auth.continue")}
                            </Link>
                        </span>
                    </footer>
                )}
            </div>
        </section>
    );
}
