import { ButtonVariant, FieldType } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { usePasswordResetForm } from "../../model/danger-zone/use-password-reset.form";
import { PasswordResetMethod, PasswordResetStep } from "../../model/danger-zone/enums";
import { securityStyles } from "../security/styles";

export function PasswordResetForm(props: AccountDangerZone.PasswordReset.Props) {
    const { t } = useTranslation();
    const { form, method, step, pending, remaining, sendCode, goBack, sendingCode } = usePasswordResetForm(props);

    return (
        <Form form={form} aria-label={t("dangerZone.resetPassword")}>
            <Form.Fields disabled={pending || sendingCode} className={securityStyles.fields}>
                {step === PasswordResetStep.VERIFICATION && (
                    <>
                        <Field.Select
                            reserveErrorSpace={false}
                            form={form}
                            name="method"
                            label={t("security.authentication")}
                            options={[
                                { value: PasswordResetMethod.OTP, label: t("dangerZone.emailConfirmation") },
                                { value: PasswordResetMethod.RECOVERY_CODE, label: t("passwordRecovery.recoveryCode") },
                            ]}
                        />
                        <Field.Code
                            reserveErrorSpace={false}
                            key={method}
                            form={form}
                            name="code"
                            length={method === PasswordResetMethod.OTP ? 6 : 8}
                            groupSize={method === PasswordResetMethod.OTP ? undefined : 4}
                            normalizeValue={(value) => value.toUpperCase().replace(/[^0-9A-F]/g, "")}
                            validationType={method === PasswordResetMethod.OTP ? "numeric" : "alphanumeric"}
                            label={method === PasswordResetMethod.OTP ? t("auth.code") : t("passwordRecovery.recoveryCode")}
                            autoComplete={method === PasswordResetMethod.OTP ? "one-time-code" : "off"}
                            required
                        />
                    </>
                )}
                {step === PasswordResetStep.PASSWORD && (
                    <>
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
                    </>
                )}
            </Form.Fields>
            <Dialog.Actions leading={t("dangerZone.resetStep", { step: step === PasswordResetStep.VERIFICATION ? 1 : 2 })}>
                {step === PasswordResetStep.VERIFICATION && method === PasswordResetMethod.OTP && (
                    <Button
                        type="button"
                        variant={ButtonVariant.OUTLINE}
                        disabled={remaining > 0 || pending}
                        loading={sendingCode}
                        onClick={() => void sendCode()}>
                        {remaining > 0 ? t("otp.retryIn", { seconds: remaining }) : t("dangerZone.sendCode")}
                    </Button>
                )}
                {step === PasswordResetStep.PASSWORD && (
                    <Button type="button" variant={ButtonVariant.OUTLINE} onClick={goBack} disabled={pending}>
                        {t("common.back")}
                    </Button>
                )}
                <Button type="submit" loading={pending} disabled={sendingCode}>
                    {step === PasswordResetStep.VERIFICATION ? t("dangerZone.continue") : t("common.save")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
