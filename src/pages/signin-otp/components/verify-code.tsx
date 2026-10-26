import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { NotificationManager } from "~common/notifications";
import { useCooldownOTP, useAuthentication } from "~auth";
import { getValidationErrors } from "~api/validation";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { OTPFlow } from "~src/enums";
import { API } from "~api";

import { pageStyles } from "../styles";

export function VerifyCode({ authorizationRequest }: SigninOTP.Verify.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNIN });
    const continueAuthentication = useAuthentication();

    const form = useForm({
        defaultValues: { code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                if (!authorizationRequest) {
                    throw new Error(t("auth.requestMissing"));
                }
                const response = await IdentitySDK.authnControllerVerifyOtp({
                    axios: API.identityPublic,
                    body: { code: value.code, authorizationRequest },
                    throwOnError: true,
                });
                await continueAuthentication({
                    response: response.data,
                    authorizationRequest,
                });
                formApi.reset();
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["code"] });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

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
            {remaining > 0 && <p className={pageStyles.cooldown}>{t("otp.retryIn", { seconds: remaining })}</p>}
            <Form.Links>
                <Link
                    to={{
                        search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
                    }}>
                    {t("otp.requestAnother")}
                </Link>
            </Form.Links>
        </Form>
    );
}
