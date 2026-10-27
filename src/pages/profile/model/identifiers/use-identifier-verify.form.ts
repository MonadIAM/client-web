import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

import { CooldownOTP, useCooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";
import { NotificationManager } from "~shared/notifications";

import { SecuritySchema } from "../security/schema";
import { identifierMutationKey } from "./use-identifiers.query";
import { IdentifierManager } from "./identifier.manager";
import { useIdentifierRefresh } from "./use-identifier-refresh";

export function useIdentifierVerifyForm({ identity, onVerified }: Identifiers.Verify.Props) {
    const { t } = useTranslation();
    const refresh = useIdentifierRefresh();
    const remaining = useCooldownOTP({ flow: OTPFlow.IDENTIFIER });

    const request = useMutation({
        mutationKey: identifierMutationKey,
        mutationFn: IdentifierManager.verify,
    });

    const resendRequest = useMutation({
        mutationKey: identifierMutationKey,
        mutationFn: () => IdentifierManager.resend({ identifier: identity }),

        onSuccess: () => {
            CooldownOTP.start({ flow: OTPFlow.IDENTIFIER });

            NotificationManager.success({ title: t("identifiers.codeSent") });
        },

        onError: (cause) => {
            CooldownOTP.recover({ flow: OTPFlow.IDENTIFIER, cause });

            NotificationManager.error({ cause });
        },
    });

    const form = useForm({
        defaultValues: { code: "" },

        validators: {
            onSubmit: ({ value }) => {
                if (!SecuritySchema.code.safeParse(value.code).success) {
                    return { fields: { code: t("security.invalidCode") } };
                }

                return undefined;
            },
        },

        onSubmit: async ({ value, formApi }) => {
            try {
                await request.mutateAsync(value);

                void refresh();

                NotificationManager.success({
                    title: t("identifiers.verifiedMessage"),
                });

                onVerified();
            } catch (cause) {
                if (cause instanceof AxiosError && cause.response?.status === 400) {
                    formApi.setErrorMap({
                        onSubmit: {
                            fields: { code: t("identifiers.invalid.expiredCode") },
                        },
                    });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending, remaining, resendRequest };
}
