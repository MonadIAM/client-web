import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { securityQueryKey } from "../security/use-security.query";
import { DangerZoneManager } from "./danger-zone.manager";
import { dangerZoneMutationKey } from "./constants";

export function usePasswordForm({ hasPassword, onComplete }: AccountDangerZone.Password.Props) {
    const { t } = useTranslation();
    const client = useQueryClient();

    const operation = useMutation({
        mutationKey: dangerZoneMutationKey,
        gcTime: 0,
        mutationFn: async (value: AccountDangerZone.Password.Values) => {
            if (hasPassword) {
                await DangerZoneManager.changePassword({
                    currentPassword: value.currentPassword,
                    newPassword: value.password,
                });
            } else {
                await DangerZoneManager.setPassword({
                    password: value.password,
                });
            }
        },
    });

    const defaultValues: AccountDangerZone.Password.Values = {
        currentPassword: "",
        confirmation: "",
        password: "",
    };

    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: ({ value }) => {
                if (!value.password) {
                    return { fields: { password: t("validation.required") } };
                } else if (value.password !== value.confirmation) {
                    return {
                        fields: {
                            confirmation: t("dangerZone.passwordMismatch"),
                        },
                    };
                } else if (hasPassword && !value.currentPassword) {
                    return {
                        fields: { currentPassword: t("validation.required") },
                    };
                } else {
                    return undefined;
                }
            },
        },
        onSubmit: async ({ value, formApi }) => {
            try {
                await operation.mutateAsync(value);
                formApi.reset();
                await client.invalidateQueries({ queryKey: securityQueryKey });
                NotificationManager.success({
                    title: t("dangerZone.passwordSaved"),
                });
                onComplete();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["currentPassword", "password", "newPassword"],
                });
                if (fields) {
                    formApi.setErrorMap({
                        onSubmit: {
                            fields: {
                                currentPassword: fields.currentPassword,
                                password: fields.password ?? fields.newPassword,
                            },
                        },
                    });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending };
}
