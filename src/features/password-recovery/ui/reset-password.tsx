import { FieldType, FormSpacing, TextAlign, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Field, Form, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useCooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";

import { PasswordRecoveryStep } from "../model/steps";
import { useResetPasswordForm } from "../model/reset";

export function ResetPassword({ identifier, method, onComplete, onBack }: PasswordRecovery.Reset.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });
    const { form, isSubmitting, schema } = useResetPasswordForm({ identifier, method, onComplete, onBack });

    return (
        <Form form={form} aria-label={t("passwordRecovery.confirmTitle")}>
            <Form.Fields>
                <Field.Text
                    form={form}
                    name="identifier"
                    validators={{ onChange: schema.shape.identifier }}
                    label={t("auth.identifier")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
                <Field.Code
                    form={form}
                    name="code"
                    length={method === PasswordRecoveryStep.OTP ? 6 : 9}
                    validationType={method === PasswordRecoveryStep.OTP ? "numeric" : "none"}
                    validators={{ onChange: schema.shape.code }}
                    label={t(method === PasswordRecoveryStep.OTP ? "auth.code" : "passwordRecovery.recoveryCode")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete={method === PasswordRecoveryStep.OTP ? "one-time-code" : "off"}
                    spellCheck={false}
                    required
                />
                <Field.Text
                    form={form}
                    name="password"
                    validators={{ onChange: schema.shape.password }}
                    type={FieldType.PASSWORD}
                    label={t("auth.newPassword")}
                    invalidMessage={t("validation.invalid")}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    autoComplete="new-password"
                    required
                />
            </Form.Fields>
            <Form.Actions gap={FormSpacing.LARGE}>
                <Button type="submit" loading={isSubmitting}>
                    {t("passwordRecovery.save")}
                </Button>
            </Form.Actions>
            {method === PasswordRecoveryStep.OTP && remaining > 0 && (
                <Text.P tone={TextTone.MUTED} align={TextAlign.CENTER}>
                    {t("otp.retryIn", { seconds: remaining })}
                </Text.P>
            )}
            <Form.Links>
                <Button.Link onClick={() => onBack(form.state.values.identifier.trim())}>
                    {t("passwordRecovery.back")}
                </Button.Link>
            </Form.Links>
        </Form>
    );
}
