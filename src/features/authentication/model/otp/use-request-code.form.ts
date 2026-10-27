import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { CooldownOTP, useCooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";

import { useRequestCodeQuery } from "./use-request-code.query";

export function useRequestCodeForm({ authorizationRequest, identifier, onContinue }: SigninOTP.Request.Props) {
    const request = useRequestCodeQuery();
    const { t } = useTranslation();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNIN });

    const form = useForm({
        defaultValues: { identifier },
        onSubmit: async ({ value, formApi }) => {
            if (!CooldownOTP.remaining({ flow: OTPFlow.SIGNIN })) {
                try {
                    if (!authorizationRequest) {
                        throw new Error(t("auth.requestMissing"));
                    }
                    const identifier = value.identifier.trim();
                    await request.mutateAsync({ identifier, authorizationRequest });

                    onContinue(identifier);
                } catch (cause) {
                    const fields = getValidationErrors({
                        cause,
                        fields: ["identifier"],
                    });
                    if (fields) {
                        formApi.setErrorMap({ onSubmit: { fields } });
                    } else {
                        NotificationManager.error({ cause });
                    }
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

    return { form, isSubmitting, remaining };
}
