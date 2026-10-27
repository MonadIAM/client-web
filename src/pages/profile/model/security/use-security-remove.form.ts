import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { SecurityManager } from "./security.manager";
import { SecurityAuthentication } from "./enums";
import { SecuritySchema } from "./schema";

export function useSecurityRemoveForm({ remove, onRemoved, mutationKey, successMessage }: Security.Remove.Props) {
    const { t } = useTranslation();

    const [authenticated, setAuthenticated] = useState(false);

    const authentication = useMutation({
        mutationKey,
        mutationFn: SecurityManager.authenticate,
        gcTime: 0,
    });

    const removal = useMutation({
        mutationKey,
        mutationFn: remove,
    });

    const defaultValues: Security.Remove.Values = {
        method: SecurityAuthentication.PASSWORD,
        password: "",
        code: "",
    };

    const form = useForm({
        defaultValues,

        validators: {
            onSubmit: ({ value }) => {
                if (authenticated) {
                    return undefined;
                }

                if (
                    value.method === SecurityAuthentication.PASSWORD &&
                    !SecuritySchema.password.safeParse(value.password).success
                ) {
                    return {
                        fields: { password: t("security.invalidPassword") },
                    };
                }

                if (
                    value.method === SecurityAuthentication.SECOND_FACTOR &&
                    !SecuritySchema.code.safeParse(value.code).success
                ) {
                    return { fields: { code: t("security.invalidCode") } };
                }

                return undefined;
            },
        },

        onSubmit: async ({ value, formApi }) => {
            try {
                if (authenticated) {
                    await removal.mutateAsync();

                    NotificationManager.success({ title: successMessage });

                    onRemoved();
                } else {
                    await authentication.mutateAsync(value);

                    setAuthenticated(true);
                }
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["password", "code"],
                });

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

    return { form, method, pending, authenticated };
}
