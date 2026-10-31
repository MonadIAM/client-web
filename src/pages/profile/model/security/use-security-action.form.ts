import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { CooldownOTP, OTPFlow, useCooldownOTP } from "~shared/auth/otp";
import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { SecurityManager } from "./security.manager";
import { SecurityAuthentication } from "./enums";
import { SecuritySchema } from "./schema";

export function useSecurityActionForm({
    action,
    onComplete,
    mutationKey,
    successMessage,
    security,
    authenticateOnly,
    method: requiredMethod,
}: Security.Action.FieldsProps) {
    const { t } = useTranslation();

    const [authenticated, setAuthenticated] = useState(false);
    const remaining = useCooldownOTP({ flow: OTPFlow.REAUTHENTICATION });

    const authentication = useMutation({
        mutationKey,
        mutationFn: SecurityManager.authenticate,
        gcTime: 0,
    });

    const operation = useMutation({
        mutationKey,
        mutationFn: action,
        gcTime: 0,
    });

    const requestCode = useMutation({
        mutationKey,
        mutationFn: SecurityManager.requestCode,
        gcTime: 0,
    });

    let defaultMethod = SecurityAuthentication.EMAIL;
    if (security.hasPassword) {
        defaultMethod = SecurityAuthentication.PASSWORD;
    } else if (security.hasSecondFactor) {
        defaultMethod = SecurityAuthentication.SECOND_FACTOR;
    }

    const defaultValues: Security.Action.Values = {
        method: requiredMethod ?? defaultMethod,
        password: "",
        code: "",
    };

    const form = useForm({
        defaultValues,

        validators: {
            onSubmit: ({ value }) => {
                if (authenticated) {
                    return undefined;
                } else if (
                    value.method === SecurityAuthentication.PASSWORD &&
                    !SecuritySchema.password.safeParse(value.password).success
                ) {
                    return {
                        fields: { password: t("security.invalidPassword") },
                    };
                } else if (
                    value.method !== SecurityAuthentication.PASSWORD &&
                    !SecuritySchema.code.safeParse(value.code).success
                ) {
                    return { fields: { code: t("security.invalidCode") } };
                } else {
                    return undefined;
                }
            },
        },

        onSubmit: async ({ value, formApi }) => {
            try {
                if (authenticated) {
                    await operation.mutateAsync();

                    if (successMessage) {
                        NotificationManager.success({ title: successMessage });
                    }

                    onComplete();
                } else {
                    await authentication.mutateAsync(value);

                    if (authenticateOnly) {
                        onComplete();
                    } else {
                        setAuthenticated(true);
                    }
                }
            } catch (cause) {
                setAuthenticated(false);
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

    const sendCode: Security.Action.SendCode.Signature = async () => {
        if (CooldownOTP.remaining({ flow: OTPFlow.REAUTHENTICATION }) === 0 && !requestCode.isPending) {
            try {
                await requestCode.mutateAsync();
                CooldownOTP.start({ flow: OTPFlow.REAUTHENTICATION });
            } catch (cause) {
                CooldownOTP.recover({ flow: OTPFlow.REAUTHENTICATION, cause });

                if (CooldownOTP.remaining({ flow: OTPFlow.REAUTHENTICATION }) === 0) {
                    NotificationManager.error({ cause });
                }
            }
        }
    };

    return {
        form,
        method,
        pending,
        authenticated,
        remaining,
        sendCode,
        sendingCode: requestCode.isPending,
    };
}
