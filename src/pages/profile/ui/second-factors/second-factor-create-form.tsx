import { Dialog, Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useSecondFactorCreateForm } from "../../model/second-factors/use-second-factor-create.form";
import { SecondFactorType } from "../../model/second-factors/enums";
import { securityStyles } from "../security/styles";

export function SecondFactorCreateForm(props: SecondFactors.Create.Props) {
    const { t } = useTranslation();
    const { form, pending } = useSecondFactorCreateForm(props);

    return (
        <Form form={form} aria-label={t("secondFactors.add")}>
            <Form.Fields disabled={pending} className={securityStyles.fields}>
                <Field.Select
                    form={form}
                    name="type"
                    label={t("secondFactors.type")}
                    options={[{ value: SecondFactorType.TOTP, label: "TOTP" }]}
                    reserveErrorSpace={false}
                />
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
            <Dialog.Actions leading={t("secondFactors.step", { step: 1 })}>
                <Button type="submit" loading={pending}>
                    {t("secondFactors.continue")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
