import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { securityQueryKey } from "../security/use-security.query";
import { SecurityManager } from "../security/security.manager";
import { DangerZoneManager } from "./danger-zone.manager";
import { dangerZoneMutationKey } from "./constants";

export function usePasswordForm({ hasPassword, onComplete }: AccountDangerZone.Password.Props) {
    const { t } = useTranslation();
    const client = useQueryClient();
    const [authenticationRequired, setAuthenticationRequired] = useState(false);

    const operation = useMutation({
        mutationKey: dangerZoneMutationKey,
        gcTime: 0,
        mutationFn: async (value: AccountDangerZone.Password.Values) => {
            if (hasPassword) {
                await DangerZoneManager.changePassword({
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
        confirmation: "",
        password: "",
    };

    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: ({ value }) => {
                if (!value.password) {
                    return { fields: { password: t("validation.required") } };
                } else if (value.password === value.confirmation) {
                    return undefined;
                } else {
                    return { fields: { confirmation: t("dangerZone.passwordMismatch") } };
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
                if (SecurityManager.requiresReauthentication({ cause })) {
                    setAuthenticationRequired(true);
                } else {
                    const fields = getValidationErrors({
                        cause,
                        fields: ["password", "newPassword"],
                    });
                    if (fields) {
                        formApi.setErrorMap({
                            onSubmit: {
                                fields: {
                                    password: fields.password ?? fields.newPassword,
                                },
                            },
                        });
                    } else {
                        NotificationManager.error({ cause });
                    }
                }
            }
        },
    });

    const pending = useSelector(form.store, (state) => state.isSubmitting);

    const authenticate = async () => {
        setAuthenticationRequired(false);
        await form.handleSubmit();
    };

    return { form, pending, authenticationRequired, authenticate };
}
