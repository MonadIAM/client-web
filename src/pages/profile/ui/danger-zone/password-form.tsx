import { ButtonVariant, FieldType, FormDirection } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { usePasswordForm } from "../../model/danger-zone/use-password.form";

export function PasswordForm(props: AccountDangerZone.Password.Props) {
    const { t } = useTranslation();
    const { form, pending } = usePasswordForm(props);

    return (
        <Form form={form}>
            <Form.Fields disabled={pending}>
                {props.hasPassword && (
                    <Field.Text
                        form={form}
                        name="currentPassword"
                        type={FieldType.PASSWORD}
                        autoComplete="current-password"
                        label={t("dangerZone.currentPassword")}
                        showPasswordLabel={t("auth.showPassword")}
                        hidePasswordLabel={t("auth.hidePassword")}
                        required
                    />
                )}
                <Field.Text
                    form={form}
                    name="password"
                    type={FieldType.PASSWORD}
                    autoComplete="new-password"
                    label={t("dangerZone.newPassword")}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    required
                />
                <Field.Text
                    form={form}
                    name="confirmation"
                    type={FieldType.PASSWORD}
                    autoComplete="new-password"
                    label={t("dangerZone.confirmPassword")}
                    showPasswordLabel={t("auth.showPassword")}
                    hidePasswordLabel={t("auth.hidePassword")}
                    required
                />
            </Form.Fields>
            <Form.Actions direction={FormDirection.HORIZONTAL}>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending}>
                    {t("common.save")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
