import { ButtonVariant, FieldType, FormAlignment, SpinnerVariant } from "@monadiam/ui-kit/enums";
import { Button, Field, Form, Spinner } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { JSX, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import { AuthWorkerClient, useSession, useAuthentication } from "~auth";
import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { IdentitySchemas } from "~api/schemas";
import { SessionStatus } from "~src/enums";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

import { SocialAuth } from "./components/social-auth";
import { pageStyles } from "./styles";

export function SignIn(): JSX.Element {
    const { t } = useTranslation();
    const session = useSession();
    const continueAuthentication = useAuthentication();
    const [attempt, setAttempt] = useState(0);
    const [providerPending, setProviderPending] = useState(false);
    const [authorization, setAuthorization] = useState<Auth.WorkerClient.Authorization>();
    const [parameters] = useSearchParams();

    const authorizationRequest = parameters.get("authorizationRequest");
    const available = session.status === SessionStatus.ANONYMOUS || session.status === SessionStatus.UNAVAILABLE;
    const retryAllowed = session.error === undefined || attempt > 0;
    const shouldAuthorize = !authorizationRequest && available && retryAllowed;
    const preparing = shouldAuthorize && !authorization?.error;

    const form = useForm({
        defaultValues: { identifier: "", password: "" },

        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await authenticate(value);
                await continueAuthentication({ response, authorizationRequest });
                formApi.reset();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "password"],
                });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    useEffect(() => {
        let active = true;
        if (shouldAuthorize) {
            void AuthWorkerClient.authorize().then((result) => {
                if (active) {
                    setAuthorization(result);
                    if (result.url) {
                        location.replace(result.url);
                    }
                }
            });
        }

        return () => {
            active = false;
        };
    }, [shouldAuthorize, attempt]);

    async function authenticate(values: Pick<API.Identity.AuthnPasswordBody, "identifier" | "password">): Promise<unknown> {
        if (authorizationRequest) {
            const response = await IdentitySDK.authnControllerPassword({
                axios: API.identityPublic,
                body: {
                    identifier: values.identifier,
                    password: values.password,
                    authorizationRequest,
                },
                throwOnError: true,
            });
            return response.data;
        } else {
            throw new Error(t("auth.requestMissing"));
        }
    }

    return (
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{t("auth.signin")}</h1>
                    <p className={pageStyles.description}>{t("auth.signinDescription")}</p>
                </header>
                <div className={pageStyles.panel} aria-busy={preparing}>
                    {preparing ? (
                        <div className={pageStyles.authPreparation} role="status">
                            <Spinner variant={SpinnerVariant.INLINE} aria-hidden="true" />
                            <p>{t("auth.preparing")}</p>
                            <p className={pageStyles.description}>{t("auth.preparingDescription")}</p>
                        </div>
                    ) : (
                        <>
                            <Form form={form} aria-label={t("auth.signin")} disabled={providerPending}>
                                {({ isSubmitting }) => (
                                    <>
                                        <form.Field
                                            name="identifier"
                                            validators={{ onChange: IdentitySchemas.zAuthnPasswordBody.shape.identifier }}>
                                            {(field) => (
                                                <Field
                                                    field={field}
                                                    invalidMessage={t("validation.invalid")}
                                                    label={t("auth.identifier")}
                                                    autoCapitalize="none"
                                                    spellCheck={false}
                                                    autoComplete="username"
                                                    required
                                                />
                                            )}
                                        </form.Field>
                                        <form.Field
                                            name="password"
                                            validators={{ onChange: IdentitySchemas.zAuthnPasswordBody.shape.password }}>
                                            {(field) => (
                                                <Field
                                                    field={field}
                                                    invalidMessage={t("validation.invalid")}
                                                    label={t("auth.password")}
                                                    action={
                                                        <Link
                                                            to={{
                                                                pathname: "/password-recovery",
                                                                search: authorizationRequest
                                                                    ? `?${new URLSearchParams({ authorizationRequest })}`
                                                                    : "",
                                                            }}>
                                                            {t("passwordRecovery.forgot")}
                                                        </Link>
                                                    }
                                                    type={FieldType.PASSWORD}
                                                    showPasswordLabel={t("auth.showPassword")}
                                                    hidePasswordLabel={t("auth.hidePassword")}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                            )}
                                        </form.Field>
                                        <Form.Actions>
                                            <Button type="submit" disabled={!authorizationRequest} loading={isSubmitting}>
                                                {t("nav.signin")}
                                            </Button>
                                        </Form.Actions>
                                        <Form.Links align={FormAlignment.START}>
                                            <Link
                                                to={{
                                                    pathname: "/signin/otp",
                                                    search: authorizationRequest
                                                        ? `?${new URLSearchParams({ authorizationRequest })}`
                                                        : "",
                                                }}>
                                                {t("auth.useCode")}
                                            </Link>
                                        </Form.Links>
                                        <SocialAuth
                                            authorizationRequest={authorizationRequest}
                                            onPendingChange={setProviderPending}
                                        />
                                    </>
                                )}
                            </Form>
                            {!authorizationRequest && (session.error ?? authorization?.error) && (
                                <Button
                                    variant={ButtonVariant.OUTLINE}
                                    onClick={() => {
                                        setAuthorization(undefined);
                                        AuthWorkerClient.retryAuthorization();
                                        setAttempt((value) => value + 1);
                                    }}>
                                    {t("common.retry")}
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <Form.Links className={pageStyles.footer}>
                    <span>
                        {t("auth.noAccount")}{" "}
                        <Link
                            to={{
                                pathname: "/signup",
                                search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
                            }}>
                            {t("nav.signup")}
                        </Link>
                    </span>
                </Form.Links>
            </div>
        </section>
    );
}
