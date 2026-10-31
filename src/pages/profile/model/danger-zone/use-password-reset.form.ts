import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { CooldownOTP, OTPFlow, useCooldownOTP } from "~shared/auth/otp";
import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { DangerZoneManager } from "./danger-zone.manager";
import { dangerZoneMutationKey } from "./constants";
import { PasswordResetMethod } from "./enums";

export function usePasswordResetForm({ onComplete }: AccountDangerZone.PasswordReset.Props) {
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });
    const operation = useMutation({
        mutationKey: dangerZoneMutationKey,
        mutationFn: DangerZoneManager.resetPassword,
        gcTime: 0,
    });
    const requestCode = useMutation({
        mutationKey: dangerZoneMutationKey,
        mutationFn: DangerZoneManager.requestPasswordReset,
        gcTime: 0,
    });
    const defaultValues: AccountDangerZone.PasswordReset.Values = {
        method: PasswordResetMethod.OTP,
        confirmation: "",
        password: "",
        code: "",
    };
    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: ({ value }) => {
                if (!value.password) {
                    return { fields: { password: t("validation.required") } };
                } else if (!value.code) {
                    return { fields: { code: t("validation.required") } };
                } else if (value.password === value.confirmation) {
                    return undefined;
                } else {
                    return { fields: { confirmation: t("dangerZone.passwordMismatch") } };
                }
            },
        },
        onSubmit: async ({ value, formApi }) => {
            try {
                await operation.mutateAsync({ method: value.method, password: value.password, code: value.code });
                formApi.reset();
                NotificationManager.success({ title: t("dangerZone.passwordSaved") });
                onComplete();
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["password", "code"] });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });
    const method = useSelector(form.store, (state) => state.values.method);
    const pending = useSelector(form.store, (state) => state.isSubmitting);

    const sendCode = async () => {
        if (CooldownOTP.remaining({ flow: OTPFlow.PASSWORD }) === 0 && !requestCode.isPending) {
            try {
                await requestCode.mutateAsync();
                CooldownOTP.start({ flow: OTPFlow.PASSWORD });
            } catch (cause) {
                CooldownOTP.recover({ flow: OTPFlow.PASSWORD, cause });
                if (CooldownOTP.remaining({ flow: OTPFlow.PASSWORD }) === 0) {
                    NotificationManager.error({ cause });
                }
            }
        }
    };

    return { form, method, pending, remaining, sendCode, sendingCode: requestCode.isPending };
}
