import { Text, Flex, Button, Field, Form, Spinner, useForm, useSelector, Container } from "@monadiam/ui-kit";
import { JSX, useEffect, useState, Fragment } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FlexJustification,
    SpinnerVariant,
    FlexAlignment,
    ButtonVariant,
    FormAlignment,
    FieldType,
    TextTone,
} from "@monadiam/ui-kit/enums";

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

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

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
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <Text.H1>{t("auth.signin")}</Text.H1>
                    <Text.P tone={TextTone.MUTED}>{t("auth.signinDescription")}</Text.P>
                </header>
                <Container render={<Flex.Col gap="1.25rem" />} aria-busy={preparing}>
                    {preparing ? (
                        <Flex.Col
                            align={FlexAlignment.CENTER}
                            justify={FlexJustification.CENTER}
                            gap="0.75rem"
                            className={pageStyles.authPreparation}
                            role="status">
                            <Spinner variant={SpinnerVariant.INLINE} aria-hidden="true" />
                            <Text.P>{t("auth.preparing")}</Text.P>
                            <Text.P tone={TextTone.MUTED}>{t("auth.preparingDescription")}</Text.P>
                        </Flex.Col>
                    ) : (
                        <Fragment>
                            <Form form={form} aria-label={t("auth.signin")}>
                                <Form.Fields disabled={providerPending}>
                                    <Field.Text
                                        form={form}
                                        name="identifier"
                                        validators={{ onChange: IdentitySchemas.zAuthnPasswordBody.shape.identifier }}
                                        invalidMessage={t("validation.invalid")}
                                        label={t("auth.identifier")}
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        autoComplete="username"
                                        required
                                    />
                                    <Field.Text
                                        form={form}
                                        name="password"
                                        validators={{ onChange: IdentitySchemas.zAuthnPasswordBody.shape.password }}
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
                                </Form.Fields>
                                <Form.Actions>
                                    <Button
                                        type="submit"
                                        disabled={!authorizationRequest || providerPending}
                                        loading={isSubmitting}>
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
                                    disabled={isSubmitting}
                                    authorizationRequest={authorizationRequest}
                                    onPendingChange={setProviderPending}
                                />
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
                        </Fragment>
                    )}
                </Container>
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
