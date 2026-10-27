import { useForm, useSelector } from "@monadiam/ui-kit";
import { useNavigate } from "react-router";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { useResetSecondFactorQuery } from "./use-reset-second-factor.query";

export function useResetSecondFactorForm({ search }: Authentication.ResetSecondFactor.Props) {
    const request = useResetSecondFactorQuery();
    const navigate = useNavigate();

    const form = useForm({
        defaultValues: { identifier: "", code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                await request.mutateAsync({
                    identifier: value.identifier.trim(),
                    code: value.code.trim(),
                });
                formApi.reset();
                await navigate({ pathname: "/signin", search });
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "code"],
                });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

    return { form, isSubmitting };
}
