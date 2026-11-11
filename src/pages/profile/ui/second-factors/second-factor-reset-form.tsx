import { ButtonVariant } from "@monadiam/ui-kit/enums";
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
                <Warning title={t("secondFactors.resetWarning")}>{t("secondFactors.resetDescription")}</Warning>
                <Field.Code
                    form={form}
                    name="code"
                    length={8}
                    groupSize={4}
                    validationType="alphanumeric"
                    normalizeValue={(value) => value.toUpperCase().replace(/[^0-9A-F]/g, "")}
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
            <Dialog.Actions>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending} variant={ButtonVariant.DESTRUCTIVE}>
                    {t("common.reset")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
