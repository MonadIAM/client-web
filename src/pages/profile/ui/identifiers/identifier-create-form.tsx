import { FieldType, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Field, Form, Radio } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { IdentifierType } from "~shared/api/generated/identity";

import { useIdentifierCreateForm } from "../../model/identifiers/use-identifier-create.form";
import { securityStyles } from "../security/styles";

export function IdentifierCreateForm(props: Identifiers.Create.Props) {
    const { t } = useTranslation();
    const { form, type, pending } = useIdentifierCreateForm(props);

    return (
        <Form form={form} aria-label={t("identifiers.add")}>
            <Form.Fields className={securityStyles.fields}>
                <Radio.Group
                    label={t("identifiers.type")}
                    name="identifier-type"
                    value={type}
                    disabled={pending}
                    onValueChange={(value) => {
                        if (value === IdentifierType.EMAIL || value === IdentifierType.PHONE) {
                            form.setFieldValue("type", value);
                        }
                    }}>
                    <Radio value={IdentifierType.EMAIL} label={t("identifiers.email")} />
                    <Radio value={IdentifierType.PHONE} label={t("identifiers.phone")} />
                </Radio.Group>
                <Field.Text
                    reserveErrorSpace={false}
                    form={form}
                    name="identifier"
                    type={type === IdentifierType.EMAIL ? FieldType.EMAIL : FieldType.TEL}
                    label={type === IdentifierType.EMAIL ? t("identifiers.email") : t("identifiers.phone")}
                    autoComplete={type === IdentifierType.EMAIL ? "email" : "tel"}
                    placeholder={type === IdentifierType.EMAIL ? "name@example.com" : "+447700900123"}
                    required
                />
            </Form.Fields>
            <Form.Actions spacing={FormSpacing.LARGE}>
                <Button type="submit" loading={pending}>
                    {t("identifiers.send")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
