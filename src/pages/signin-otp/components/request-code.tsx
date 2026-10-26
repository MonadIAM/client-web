import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { CooldownOTP, useCooldownOTP } from "~auth";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { OTPFlow } from "~src/enums";
import { API } from "~api";

export function RequestCode({ authorizationRequest, identifier, onContinue }: SigninOTP.Request.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNIN });

    const form = useForm({
        defaultValues: { identifier },
        onSubmit: async ({ value, formApi }) => {
            if (!CooldownOTP.remaining({ flow: OTPFlow.SIGNIN })) {
                try {
                    if (!authorizationRequest) {
                        throw new Error(t("auth.requestMissing"));
                    }
                    const identifier = value.identifier.trim();
                    const response = await IdentitySDK.authnControllerRequestOtp({
                        axios: API.identityPublic,
                        body: { identifier, authorizationRequest },
                        throwOnError: true,
                    });
                    CooldownOTP.start({ flow: OTPFlow.SIGNIN });
                    NotificationManager.response({ data: response.data });
                    onContinue(identifier);
                } catch (cause) {
                    CooldownOTP.recover({ flow: OTPFlow.SIGNIN, cause });
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
        <Form form={form} aria-label={t("otp.requestTitle")}>
            <Form.Fields>
                <Field.Text
                    form={form}
                    name="identifier"
                    validators={{ onChange: IdentitySchemas.zAuthnRequestOtpBody.shape.identifier }}
                    label={t("auth.identifier")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
            </Form.Fields>
            <Form.Actions>
                <Button type="submit" loading={isSubmitting} disabled={!authorizationRequest || remaining > 0}>
                    {remaining ? t("otp.retryIn", { seconds: remaining }) : t("otp.send")}
                </Button>
            </Form.Actions>
            {authorizationRequest && (
                <Form.Links>
                    <Button.Link onClick={() => onContinue(form.state.values.identifier.trim())}>
                        {t("otp.haveCode")}
                    </Button.Link>
                </Form.Links>
            )}
        </Form>
    );
}
