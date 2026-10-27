import { FieldType, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { IdentitySchemas } from "~shared/api/schemas";

import { useRegistrationForm } from "../model/registration";

export function Registration({ identifier, onContinue }: Signup.Registration.Props) {
    const { t } = useTranslation();
    const { form, isSubmitting } = useRegistrationForm({ identifier, onContinue });

    return (
        <Form form={form} aria-label={t("auth.signup")}>
            <Form.Fields>
                <Field.Text
                    form={form}
                    name="name"
                    validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.name }}
                    invalidMessage={t("validation.invalid")}
                    label={t("auth.name")}
                    autoComplete="name"
                    required
                />
                <Field.Text
                    form={form}
                    name="identifier"
                    validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.identifier }}
                    invalidMessage={t("validation.invalid")}
                    label={t("auth.identifier")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                />
                <Field.Text
                    form={form}
                    name="password"
                    validators={{ onChange: IdentitySchemas.zAccountSignupBody.shape.password }}
                    invalidMessage={t("validation.invalid")}
                    label={t("auth.newPassword")}
                    type={FieldType.PASSWORD}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    autoComplete="new-password"
                    required
                />
            </Form.Fields>
            <Form.Actions gap={FormSpacing.LARGE}>
                <Button type="submit" loading={isSubmitting}>
                    {t("auth.signup")}
                </Button>
            </Form.Actions>
            <Form.Links>
                <Button.Link onClick={() => onContinue(form.state.values.identifier.trim())}>
                    {t("auth.haveCode")}
                </Button.Link>
            </Form.Links>
        </Form>
    );
}
