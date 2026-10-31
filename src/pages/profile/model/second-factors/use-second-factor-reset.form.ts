import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { secondFactorMutationKey } from "./use-second-factors.query";
import { useSecondFactorRefresh } from "./use-second-factor-refresh";
import { SecondFactorManager } from "./second-factor.manager";

export function useSecondFactorResetForm({ onReset }: SecondFactors.Reset.Props) {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();
    const request = useMutation({
        mutationKey: secondFactorMutationKey,
        mutationFn: SecondFactorManager.reset,
        gcTime: 0,
    });

    const form = useForm({
        defaultValues: { code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                await request.mutateAsync({ code: value.code.trim() });
                formApi.reset();
                void refresh();
                NotificationManager.success({ title: t("secondFactors.resetSuccess") });
                onReset();
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["code"] });

                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending };
}
