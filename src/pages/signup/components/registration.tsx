import { FieldType, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Field, Form } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";

import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { OTPFlow, SignupStep } from "~src/enums";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { CooldownOTP } from "~auth";
import { API } from "~api";

export function Registration({ onCreated, onIdentifierChange }: Signup.Registration.Props) {
    const { t } = useTranslation();
    const [parameters] = useSearchParams();

    const verificationSearch = new URLSearchParams(parameters);
    verificationSearch.set("step", SignupStep.VERIFICATION);

    const form = useForm({
        defaultValues: { name: "", identifier: "", password: "" },

        onSubmit: async ({ value, formApi }) => {
            try {
                const identifier = value.identifier.trim();
                await IdentitySDK.accountControllerSignup({
                    axios: API.identityPublic,
                    body: { ...value, identifier, name: value.name.trim() },
                    throwOnError: true,
                });
                CooldownOTP.start({ flow: OTPFlow.SIGNUP });
                formApi.reset();
                onCreated(identifier);
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["name", "identifier", "password"],
                });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    return (
        <Form form={form} aria-label={t("auth.signup")}>
            {({ isSubmitting }) => (
                <>
                    <form.Field name="name" validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.name }}>
                        {(field) => (
                            <Field
                                field={field}
                                invalidMessage={t("validation.invalid")}
                                label={t("auth.name")}
                                autoComplete="name"
                                required
                            />
                        )}
                    </form.Field>
                    <form.Field
                        name="identifier"
                        validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.identifier }}>
                        {(field) => (
                            <Field
                                field={field}
                                invalidMessage={t("validation.invalid")}
                                label={t("auth.identifier")}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                            />
                        )}
                    </form.Field>
                    <form.Field
                        name="password"
                        validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.password }}>
                        {(field) => (
                            <Field
                                field={field}
                                invalidMessage={t("validation.invalid")}
                                label={t("auth.newPassword")}
                                type={FieldType.PASSWORD}
                                showPasswordLabel={t("auth.showPassword")}
                                hidePasswordLabel={t("auth.hidePassword")}
                                autoComplete="new-password"
                                required
                            />
                        )}
                    </form.Field>
                    <Form.Actions gap={FormSpacing.LARGE}>
                        <Button type="submit" loading={isSubmitting}>
                            {t("auth.signup")}
                        </Button>
                    </Form.Actions>
                    <Form.Links>
                        <Link
                            to={{ search: `?${verificationSearch}` }}
                            onClick={() => onIdentifierChange(form.state.values.identifier.trim())}>
                            {t("auth.haveCode")}
                        </Link>
                    </Form.Links>
                </>
            )}
        </Form>
    );
}
