import { ButtonVariant, FieldType, FormDirection } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { usePasswordResetForm } from "../../model/danger-zone/use-password-reset.form";
import { PasswordResetMethod } from "../../model/danger-zone/enums";

export function PasswordResetForm(props: AccountDangerZone.PasswordReset.Props) {
    const { t } = useTranslation();
    const { form, method, pending, remaining, sendCode, sendingCode } = usePasswordResetForm(props);

    return (
        <Form form={form} aria-label={t("dangerZone.resetPassword")}>
            <Form.Fields disabled={pending || sendingCode}>
                <Field.Select
                    form={form}
                    name="method"
                    label={t("security.authentication")}
                    options={[
                        { value: PasswordResetMethod.OTP, label: t("dangerZone.emailConfirmation") },
                        { value: PasswordResetMethod.RECOVERY_CODE, label: t("passwordRecovery.recoveryCode") },
                    ]}
                />
                {method === PasswordResetMethod.OTP && (
                    <Button
                        type="button"
                        variant={ButtonVariant.OUTLINE}
                        disabled={remaining > 0 || pending}
                        loading={sendingCode}
                        onClick={() => void sendCode()}>
                        {remaining > 0 ? t("otp.retryIn", { seconds: remaining }) : t("dangerZone.sendCode")}
                    </Button>
                )}
                <Field.Code
                    key={method}
                    form={form}
                    name="code"
                    length={method === PasswordResetMethod.OTP ? 6 : 9}
                    validationType={method === PasswordResetMethod.OTP ? "numeric" : "none"}
                    label={method === PasswordResetMethod.OTP ? t("auth.code") : t("passwordRecovery.recoveryCode")}
                    autoComplete={method === PasswordResetMethod.OTP ? "one-time-code" : "off"}
                    required
                />
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
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending || sendingCode}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending} disabled={sendingCode}>
                    {t("common.save")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
