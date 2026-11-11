import { FieldType } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { securityStyles } from "../security/styles";
import { SecurityActionAuthentication } from "../security/security-action-authentication";
import { usePasswordForm } from "../../model/danger-zone/use-password.form";
import { dangerZoneMutationKey } from "../../model/danger-zone/constants";
import { SecurityAuthentication } from "../../model/security/enums";

export function PasswordForm(props: AccountDangerZone.Password.Props) {
    const { t } = useTranslation();
    const { form, pending, authenticationRequired, authenticate } = usePasswordForm(props);

    if (authenticationRequired) {
        const title = props.hasPassword ? t("dangerZone.changePassword") : t("dangerZone.setPassword");

        return (
            <SecurityActionAuthentication
                title={title}
                subject={t("security.confirmationRequired")}
                description={t(props.hasPassword ? "security.confirmWithPassword" : "security.confirmToContinue")}
                mutationKey={dangerZoneMutationKey}
                method={props.hasPassword ? SecurityAuthentication.PASSWORD : undefined}
                onComplete={authenticate}
            />
        );
    }

    return (
        <Form form={form}>
            <Form.Fields disabled={pending} className={securityStyles.fields}>
                <Field.Text
                    reserveErrorSpace={false}
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
                    reserveErrorSpace={false}
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
            <Dialog.Actions>
                <Button type="submit" loading={pending}>
                    {t("common.save")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
