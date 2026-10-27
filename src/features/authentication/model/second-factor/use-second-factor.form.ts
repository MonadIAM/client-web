import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { useSecondFactorQuery } from "./use-second-factor.query";
import { useAuthentication } from "../authorization";
import { SecondFactorSchema } from "./schema";

export function useSecondFactorForm({ authorizationRequest }: Authentication.Form.Props) {
    const { t } = useTranslation();
    const request = useSecondFactorQuery();
    const continueAuthentication = useAuthentication();

    const form = useForm({
        defaultValues: { code: "" },

        validators: {
            onSubmit: ({ value }) => {
                if (SecondFactorSchema.code.safeParse(value.code).success) {
                    return undefined;
                } else {
                    return { fields: { code: t("security.invalidCode") } };
                }
            },
        },

        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await request.mutateAsync(value);
                await continueAuthentication({
                    response,
                    authorizationRequest,
                });
                formApi.reset();
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

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

    return { form, isSubmitting };
}
