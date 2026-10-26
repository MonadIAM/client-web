import { Button, Field, Form } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { FormSpacing } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";

import { NotificationManager } from "~common/notifications";
import { PasswordRecoveryStep, OTPFlow } from "~src/enums";
import { getValidationErrors } from "~api/validation";
import { CooldownOTP, useCooldownOTP } from "~auth";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

export function RequestPassword({ identifier, onContinue, onIdentifierChange }: PasswordRecovery.Request.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });
    const [parameters] = useSearchParams();

    const otpSearch = new URLSearchParams(parameters);
    otpSearch.set("step", PasswordRecoveryStep.OTP);
    const recoverySearch = new URLSearchParams(parameters);
    recoverySearch.set("step", PasswordRecoveryStep.RECOVERY);

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
                    const fields = getValidationErrors({ cause, fields: ["identifier"] });
                    if (fields) {
                        formApi.setErrorMap({ onSubmit: { fields } });
                    } else {
                        NotificationManager.error({ cause });
                    }
                }
            }
        },
    });

    return (
        <Form form={form} aria-label={t("passwordRecovery.title")}>
            {({ isSubmitting }) => (
                <>
                    <form.Field
                        name="identifier"
                        validators={{ onChange: IdentitySchemas.zPasswordRequestResetOtpBody.shape.identifier }}>
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
                    <Form.Actions gap={FormSpacing.LARGE}>
                        <Button type="submit" loading={isSubmitting} disabled={remaining > 0}>
                            {remaining ? t("otp.retryIn", { seconds: remaining }) : t("passwordRecovery.send")}
                        </Button>
                    </Form.Actions>
                    <Form.Links>
                        <Link
                            to={{ search: `?${otpSearch}` }}
                            onClick={() => onIdentifierChange(form.state.values.identifier.trim())}>
                            {t("passwordRecovery.haveCode")}
                        </Link>
                        <Link
                            to={{ search: `?${recoverySearch}` }}
                            onClick={() => onIdentifierChange(form.state.values.identifier.trim())}>
                            {t("passwordRecovery.useRecovery")}
                        </Link>
                    </Form.Links>
                </>
            )}
        </Form>
    );
}
