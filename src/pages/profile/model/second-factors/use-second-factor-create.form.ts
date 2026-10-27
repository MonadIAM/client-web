import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { secondFactorMutationKey } from "./use-second-factors.query";
import { useSecondFactorRefresh } from "./use-second-factor-refresh";
import { SecondFactorManager } from "./second-factor.manager";
import { SecondFactorSchema } from "./schema";

export function useSecondFactorCreateForm({ onCreated }: SecondFactors.Create.Props) {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();

    const request = useMutation({
        mutationKey: secondFactorMutationKey,
        mutationFn: SecondFactorManager.create,
        gcTime: 0,
    });

    const form = useForm({
        defaultValues: { name: "" },

        validators: {
            onSubmit: ({ value }) => {
                if (!SecondFactorSchema.name.safeParse(value.name).success) {
                    return { fields: { name: t("secondFactors.invalidName") } };
                }

                return undefined;
            },
        },

        onSubmit: async ({ value, formApi }) => {
            try {
                const setup = await request.mutateAsync({ name: value.name.trim() });

                void refresh();

                onCreated(setup);
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["name"] });

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
