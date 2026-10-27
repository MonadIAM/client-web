import { Button, Field, Form, Text } from "@monadiam/ui-kit";
import { TextAlign, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";
import { useCooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";

import { useVerifyCodeForm } from "../../model/otp";

export function VerifyCode({ authorizationRequest, onBack }: SigninOTP.Verify.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNIN });
    const { form, isSubmitting } = useVerifyCodeForm({ authorizationRequest, onBack });

    return (
        <Form form={form} aria-label={t("otp.verifyTitle")}>
            <Form.Fields>
                <Field.Code
                    form={form}
                    name="code"
                    length={6}
                    validators={{ onChange: IdentitySchemas.zAuthnVerifyOtpBody.shape.code }}
                    label={t("auth.code")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="one-time-code"
                    required
                />
            </Form.Fields>
            <Form.Actions>
                <Button type="submit" loading={isSubmitting} disabled={!authorizationRequest}>
                    {t("otp.verify")}
                </Button>
            </Form.Actions>
            {remaining > 0 && (
                <Text.P tone={TextTone.MUTED} align={TextAlign.CENTER}>
                    {t("otp.retryIn", { seconds: remaining })}
                </Text.P>
            )}
            <Form.Links>
                <Button.Link onClick={() => onBack()}>{t("otp.requestAnother")}</Button.Link>
            </Form.Links>
        </Form>
    );
}
