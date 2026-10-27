import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { useVerifyCodeQuery } from "./use-verify-code.query";
import { useAuthentication } from "../authorization";

export function useVerifyCodeForm({ authorizationRequest }: SigninOTP.Verify.Props) {
    const request = useVerifyCodeQuery();
    const { t } = useTranslation();
    const continueAuthentication = useAuthentication();

    const form = useForm({
        defaultValues: { code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                if (!authorizationRequest) {
                    throw new Error(t("auth.requestMissing"));
                }
                const response = await request.mutateAsync({ code: value.code, authorizationRequest });
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
