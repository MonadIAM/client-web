import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { Dialog, Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useIdentifierVerifyForm } from "../../model/identifiers/use-identifier-verify.form";
import { securityStyles } from "../security/styles";

export function IdentifierVerifyForm(props: Identifiers.Verify.Props) {
    const { t } = useTranslation();
    const { form, pending, remaining, resendRequest } = useIdentifierVerifyForm(props);

    return (
        <Form form={form} aria-label={t("identifiers.verifyTitle")}>
            <Form.Fields disabled={resendRequest.isPending} className={securityStyles.fields}>
                <Field.Code
                    reserveErrorSpace={false}
                    form={form}
                    name="code"
                    length={6}
                    label={t("auth.code")}
                    autoComplete="one-time-code"
                    required
                />
            </Form.Fields>
            <Dialog.Actions leading={t("identifiers.step", { step: 2 })}>
                <Button
                    type="button"
                    variant={ButtonVariant.OUTLINE}
                    disabled={remaining > 0 || pending}
                    loading={resendRequest.isPending}
                    onClick={() => resendRequest.mutate()}>
                    {remaining > 0 ? t("otp.retryIn", { seconds: remaining }) : t("auth.resend")}
                </Button>
                <Button type="submit" loading={pending} disabled={resendRequest.isPending}>
                    {t("identifiers.verify")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
