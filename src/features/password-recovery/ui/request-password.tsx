import { Button, Field, Form } from "@monadiam/ui-kit";
import { FormSpacing } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";

import { useRequestPasswordForm } from "../model/request";
import { PasswordRecoveryStep } from "../model/steps";

export function RequestPassword({ identifier, onContinue }: PasswordRecovery.Request.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting, remaining } = useRequestPasswordForm({ identifier, onContinue });

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
