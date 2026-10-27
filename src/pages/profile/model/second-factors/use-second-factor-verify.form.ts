import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";

import { NotificationManager } from "~shared/notifications";

import { SecuritySchema } from "../security/schema";
import { SecondFactorManager } from "./second-factor.manager";
import { secondFactorMutationKey } from "./use-second-factors.query";
import { useSecondFactorRefresh } from "./use-second-factor-refresh";

export function useSecondFactorVerifyForm({ setup, onVerified }: SecondFactors.Verify.Props) {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();

    const request = useMutation({
        mutationKey: secondFactorMutationKey,
        mutationFn: SecondFactorManager.verify,
        gcTime: 0,
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
                const result = await request.mutateAsync({ factor: setup.id, code: value.code });

                void refresh();

                NotificationManager.success({ title: t("secondFactors.verifiedMessage") });

                onVerified(result);
            } catch (cause) {
                if (cause instanceof AxiosError && cause.response?.status === 400) {
                    formApi.setErrorMap({ onSubmit: { fields: { code: t("secondFactors.invalidCode") } } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending };
}
