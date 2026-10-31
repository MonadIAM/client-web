import { ButtonVariant, FormAlignment, FormDirection, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";

import { useSecondFactorResetForm } from "../../model/second-factors/use-second-factor-reset.form";
import { securityStyles } from "../security/styles";

export function SecondFactorResetForm(props: SecondFactors.Reset.Props) {
    const { t } = useTranslation();
    const { form, pending } = useSecondFactorResetForm(props);

    return (
        <Form form={form} aria-label={t("secondFactors.reset")}>
            <Form.Fields disabled={pending} className={securityStyles.fields}>
                <Warning title={t("secondFactors.reset")}>{t("secondFactors.resetDescription")}</Warning>
                <Field.Text
                    form={form}
                    name="code"
                    validators={{ onChange: IdentitySchemas.zSecondFactorResetCurrentBody.shape.code }}
                    label={t("resetSecondFactor.masterCode")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    reserveErrorSpace={false}
                    required
                />
            </Form.Fields>
            <Form.Actions
                direction={FormDirection.HORIZONTAL}
                align={FormAlignment.END}
                spacing={FormSpacing.LARGE}
                gap={FormSpacing.SMALL}
                className={securityStyles.footer}>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending} variant={ButtonVariant.DESTRUCTIVE}>
                    {t("secondFactors.reset")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
