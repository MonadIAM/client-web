import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Form } from "@monadiam/ui-kit";
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
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{t(verifying ? "otp.verifyTitle" : "otp.requestTitle")}</h1>
                    <p className={pageStyles.description}>
                        {t(verifying ? "otp.verifyDescription" : "otp.requestDescription")}
                    </p>
                </header>
                <div className={pageStyles.panel}>
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
                    {!authorizationRequest && <p className={pageStyles.description}>{t("auth.requestMissing")}</p>}
                </div>
                <Form.Links className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Form.Links>
            </div>
        </section>
    );
}
