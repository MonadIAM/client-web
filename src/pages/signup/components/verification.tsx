import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
import { ButtonVariant, FormSpacing } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { CooldownOTP, useCooldownOTP } from "~auth";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { OTPFlow } from "~src/enums";
import { API } from "~api";

import { SignupSchema } from "../schema";
import { pageStyles } from "../styles";

export function Verification({ identifier, onVerified }: Signup.Verification.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNUP });
    const [resending, setResending] = useState(false);

    const form = useForm({
        defaultValues: { identifier, code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await IdentitySDK.accountControllerVerify({
                    axios: API.identityPublic,
                    body: {
                        identifier: value.identifier.trim(),
                        code: value.code.trim(),
                    },
                    throwOnError: true,
                });
                onVerified(SignupSchema.verification.parse(response.data).codes);
                formApi.reset();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "code"],
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

    async function resend(): Promise<void> {
        if (!CooldownOTP.remaining({ flow: OTPFlow.SIGNUP })) {
            const parsed = IdentitySchemas.zAccountResendVerificationBody.shape.identifier.safeParse(
                form.state.values.identifier.trim(),
            );
            if (parsed.success) {
                setResending(true);
                try {
                    const response = await IdentitySDK.accountControllerResend({
                        axios: API.identityPublic,
                        body: { identifier: parsed.data },
                        throwOnError: true,
                    });
                    CooldownOTP.start({ flow: OTPFlow.SIGNUP });
                    NotificationManager.response({ data: response.data });
                } catch (cause) {
                    CooldownOTP.recover({ flow: OTPFlow.SIGNUP, cause });
                    const fields = getValidationErrors({
                        cause,
                        fields: ["identifier"],
                    });
                    if (fields) {
                        form.setErrorMap({ onSubmit: { fields } });
                    } else {
                        NotificationManager.error({ cause });
                    }
                } finally {
                    setResending(false);
                }
            } else {
                form.setErrorMap({
                    onSubmit: {
                        fields: { identifier: parsed.error.issues[0]?.message },
                    },
                });
            }
        }
    }

    return (
        <>
            {identifier && <p className={pageStyles.description}>{t("auth.verifyDescription", { identifier })}</p>}
            <Form form={form} aria-label={t("auth.verify")}>
                <Form.Fields disabled={resending}>
                    <Field.Text
                        form={form}
                        name="identifier"
                        validators={{ onChange: IdentitySchemas.zAccountVerifyBody.shape.identifier }}
                        invalidMessage={t("validation.invalid")}
                        label={t("auth.identifier")}
                        autoComplete="username"
                        required
                    />
                    <Field.Code
                        form={form}
                        name="code"
                        length={6}
                        validators={{ onChange: IdentitySchemas.zAccountVerifyBody.shape.code }}
                        invalidMessage={t("validation.invalid")}
                        label={t("auth.code")}
                        autoComplete="one-time-code"
                        required
                    />
                </Form.Fields>
                <Form.Actions gap={FormSpacing.LARGE}>
                    <Button type="submit" loading={isSubmitting} disabled={resending}>
                        {t("auth.verify")}
                    </Button>
                    <Button
                        type="button"
                        variant={ButtonVariant.OUTLINE}
                        disabled={remaining > 0 || isSubmitting}
                        loading={resending}
                        onClick={() => void resend()}>
                        {remaining ? t("otp.retryIn", { seconds: remaining }) : t("auth.resend")}
                    </Button>
                </Form.Actions>
            </Form>
        </>
    );
}
