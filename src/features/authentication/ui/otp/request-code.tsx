import { Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";

import { useRequestCodeForm } from "../../model/otp";

export function RequestCode({ authorizationRequest, identifier, onContinue }: SigninOTP.Request.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting, remaining } = useRequestCodeForm({ authorizationRequest, identifier, onContinue });

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
