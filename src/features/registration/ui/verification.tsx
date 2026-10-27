import { ButtonVariant, FormSpacing, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Field, Form, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";

import { IdentitySchemas } from "~shared/api/schemas";

import { useVerificationForm } from "../model/verification";

export function Verification({ identifier, onVerified }: Signup.Verification.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting, remaining, resending, resend } = useVerificationForm({ identifier, onVerified });

    return (
        <Fragment>
            {identifier && <Text.P tone={TextTone.MUTED}>{t("auth.verifyDescription", { identifier })}</Text.P>}
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
        </Fragment>
    );
}
