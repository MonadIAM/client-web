import { Button, Field, Form } from "@monadiam/ui-kit";
import { FormSpacing } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { useSecondFactorCreateForm } from "../../model/second-factors/use-second-factor-create.form";
import { securityStyles } from "../security/styles";

export function SecondFactorCreateForm(props: SecondFactors.Create.Props) {
    const { t } = useTranslation();
    const { form, pending } = useSecondFactorCreateForm(props);

    return (
        <Form form={form} aria-label={t("secondFactors.add")}>
            <Form.Fields className={securityStyles.fields}>
                <Field.Text
                    form={form}
                    name="name"
                    label={t("secondFactors.name")}
                    placeholder={t("secondFactors.namePlaceholder")}
                    maxLength={128}
                    reserveErrorSpace={false}
                    required
                />
            </Form.Fields>
            <Form.Actions spacing={FormSpacing.LARGE}>
                <Button type="submit" loading={pending}>
                    {t("secondFactors.continue")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
