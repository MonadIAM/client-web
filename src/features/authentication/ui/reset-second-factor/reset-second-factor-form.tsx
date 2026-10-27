import { Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";

import { useResetSecondFactorForm } from "../../model/reset-second-factor";

export function ResetSecondFactorForm({ search }: Authentication.ResetSecondFactor.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting } = useResetSecondFactorForm({ search });

    return (
        <Form form={form} aria-label={t("resetSecondFactor.title")}>
            <Form.Fields>
                <Field.Text
                    form={form}
                    name="identifier"
                    validators={{ onChange: IdentitySchemas.zSecondFactorResetBody.shape.identifier }}
                    label={t("auth.identifier")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
                <Field.Text
                    form={form}
                    name="code"
                    validators={{ onChange: IdentitySchemas.zSecondFactorResetBody.shape.code }}
                    label={t("resetSecondFactor.masterCode")}
                    invalidMessage={t("validation.invalid")}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
            </Form.Fields>
            <Form.Actions>
                <Button type="submit" loading={isSubmitting}>
                    {t("resetSecondFactor.submit")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
