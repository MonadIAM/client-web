import { FieldType, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Field, Form } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";

import { NotificationManager } from "~common/notifications";
import { PasswordRecoveryStep, OTPFlow } from "~src/enums";
import { getValidationErrors } from "~api/validation";
import { IdentitySchemas } from "~api/schemas";
import { useCooldownOTP } from "~auth";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

import { pageStyles } from "../styles";

export function ResetPassword({ identifier, method, onComplete, onIdentifierChange }: PasswordRecovery.Reset.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });
    const [parameters] = useSearchParams();

    const schema =
        method === PasswordRecoveryStep.OTP
            ? IdentitySchemas.zPasswordResetByOtpBody
            : IdentitySchemas.zPasswordResetByRecoveryCodeBody;
    const requestSearch = new URLSearchParams(parameters);
    requestSearch.delete("step");

    const form = useForm({
        defaultValues: { identifier, code: "", password: "" },

        onSubmit: async ({ value, formApi }) => {
            try {
                const reset =
                    method === PasswordRecoveryStep.OTP
                        ? IdentitySDK.passwordControllerResetByOtp
                        : IdentitySDK.passwordControllerResetByRecoveryCode;
                const response = await reset({
                    axios: API.identityPublic,
                    body: {
                        ...value,
                        identifier: value.identifier.trim(),
                        code: value.code.trim(),
                    },
                    throwOnError: true,
                });
                NotificationManager.response({ data: response.data });
                formApi.reset();
                onComplete();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "code", "password"],
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
        <Form form={form} aria-label={t("passwordRecovery.confirmTitle")}>
            {({ isSubmitting }) => (
                <>
                    <form.Field name="identifier" validators={{ onChange: schema.shape.identifier }}>
                        {(field) => (
                            <Field
                                field={field}
                                label={t("auth.identifier")}
                                invalidMessage={t("validation.invalid")}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                            />
                        )}
                    </form.Field>
                    <form.Field
                        name="code"
                        validators={{
                            onChange: schema.shape.code,
                        }}>
                        {(field) => (
                            <Field
                                field={field}
                                type={method === PasswordRecoveryStep.OTP ? FieldType.CODE : FieldType.TEXT}
                                label={t(
                                    method === PasswordRecoveryStep.OTP ? "auth.code" : "passwordRecovery.recoveryCode",
                                )}
                                invalidMessage={t("validation.invalid")}
                                autoComplete={method === PasswordRecoveryStep.OTP ? "one-time-code" : "off"}
                                spellCheck={false}
                                required
                            />
                        )}
                    </form.Field>
                    <form.Field name="password" validators={{ onChange: schema.shape.password }}>
                        {(field) => (
                            <Field
                                field={field}
                                type={FieldType.PASSWORD}
                                label={t("auth.newPassword")}
                                invalidMessage={t("validation.invalid")}
                                showPasswordLabel={t("auth.showPassword")}
                                hidePasswordLabel={t("auth.hidePassword")}
                                autoComplete="new-password"
                                required
                            />
                        )}
                    </form.Field>
                    <Form.Actions gap={FormSpacing.LARGE}>
                        <Button type="submit" loading={isSubmitting}>
                            {t("passwordRecovery.save")}
                        </Button>
                    </Form.Actions>
                    {method === PasswordRecoveryStep.OTP && remaining > 0 && (
                        <p className={pageStyles.cooldown}>{t("otp.retryIn", { seconds: remaining })}</p>
                    )}
                    <Form.Links>
                        <Link
                            to={{ search: `?${requestSearch}` }}
                            onClick={() => onIdentifierChange(form.state.values.identifier.trim())}>
                            {t("passwordRecovery.back")}
                        </Link>
                    </Form.Links>
                </>
            )}
        </Form>
    );
}
