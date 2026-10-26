import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
import { FormSpacing } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~common/notifications";
import { PasswordRecoveryStep, OTPFlow } from "~src/enums";
import { getValidationErrors } from "~api/validation";
import { CooldownOTP, useCooldownOTP } from "~auth";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

export function RequestPassword({ identifier, onContinue }: PasswordRecovery.Request.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });

    const form = useForm({
        defaultValues: { identifier },
        onSubmit: async ({ value, formApi }) => {
            if (!CooldownOTP.remaining({ flow: OTPFlow.PASSWORD })) {
                try {
                    const identifier = value.identifier.trim();
                    const response = await IdentitySDK.passwordControllerRequestOtp({
                        axios: API.identityPublic,
                        body: { identifier },
                        throwOnError: true,
                    });
                    CooldownOTP.start({ flow: OTPFlow.PASSWORD });
                    NotificationManager.response({ data: response.data });
                    onContinue(identifier, PasswordRecoveryStep.OTP);
                } catch (cause) {
                    CooldownOTP.recover({ flow: OTPFlow.PASSWORD, cause });
                    const fields = getValidationErrors({
                        cause,
                        fields: ["identifier"],
                    });
                    if (fields) {
                        formApi.setErrorMap({ onSubmit: { fields } });
                    } else {
                        NotificationManager.error({ cause });
                    }
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

    return (
        <Form form={form} aria-label={t("passwordRecovery.title")}>
            <Form.Fields>
                <Field.Text
                    form={form}
                    name="identifier"
                    validators={{ onChange: IdentitySchemas.zPasswordRequestResetOtpBody.shape.identifier }}
                    label={t("auth.identifier")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
            </Form.Fields>
            <Form.Actions gap={FormSpacing.LARGE}>
                <Button type="submit" loading={isSubmitting} disabled={remaining > 0}>
                    {remaining ? t("otp.retryIn", { seconds: remaining }) : t("passwordRecovery.send")}
                </Button>
            </Form.Actions>
            <Form.Links>
                <Button.Link onClick={() => onContinue(form.state.values.identifier.trim(), PasswordRecoveryStep.OTP)}>
                    {t("passwordRecovery.haveCode")}
                </Button.Link>
                <Button.Link onClick={() => onContinue(form.state.values.identifier.trim(), PasswordRecoveryStep.RECOVERY)}>
                    {t("passwordRecovery.useRecovery")}
                </Button.Link>
            </Form.Links>
        </Form>
    );
}
