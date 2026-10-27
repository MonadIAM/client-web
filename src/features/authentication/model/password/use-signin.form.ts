import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { useAuthentication } from "../authorization";
import { useSigninQuery } from "./use-signin.query";

export function useSigninForm({ authorizationRequest }: Authentication.Form.Props) {
    const { t } = useTranslation();
    const request = useSigninQuery();
    const continueAuthentication = useAuthentication();

    const form = useForm({
        defaultValues: { identifier: "", password: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                if (!authorizationRequest) {
                    throw new Error(t("auth.requestMissing"));
                }
                const response = await request.mutateAsync({ ...value, authorizationRequest });
                await continueAuthentication({ response, authorizationRequest });
                formApi.reset();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "password"],
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
