import { Button, Container, Field, Flex, Form, Spinner, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";
import { Link } from "react-router";
import {
    FlexJustification,
    SpinnerVariant,
    FlexAlignment,
    FormAlignment,
    ButtonVariant,
    FieldType,
    TextTone,
} from "@monadiam/ui-kit/enums";

import { IdentitySchemas } from "~shared/api/schemas";

import { useAuthorization } from "../../model/authorization";
import { useSigninForm } from "../../model/password";
import { SocialAuth } from "./social-auth";
import { signinStyles } from "./styles";

export function SigninForm({ authorizationRequest }: Authentication.Form.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting } = useSigninForm({ authorizationRequest });
    const { preparing, retry, error } = useAuthorization({ authorizationRequest });
    const [providerPending, setProviderPending] = useState(false);

    return (
        <Container render={<Flex.Col gap="1.25rem" />} aria-busy={preparing}>
            {preparing ? (
                <Flex.Col
                    align={FlexAlignment.CENTER}
                    justify={FlexJustification.CENTER}
                    gap="0.75rem"
                    className={signinStyles.preparation}
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
                                    search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
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
                    {!authorizationRequest && error && (
                        <Button variant={ButtonVariant.OUTLINE} onClick={retry}>
                            {t("common.retry")}
                        </Button>
                    )}
                </Fragment>
            )}
        </Container>
    );
}
