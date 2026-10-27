import { useForm, useSelector } from "@monadiam/ui-kit";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { CooldownOTP, useCooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";

import { useRequestPasswordQuery } from "./use-request-password.query";
import { PasswordRecoveryStep } from "../steps";

export function useRequestPasswordForm({ identifier, onContinue }: PasswordRecovery.Request.Props) {
    const request = useRequestPasswordQuery();
    const remaining = useCooldownOTP({ flow: OTPFlow.PASSWORD });

    const form = useForm({
        defaultValues: { identifier },
        onSubmit: async ({ value, formApi }) => {
            if (!CooldownOTP.remaining({ flow: OTPFlow.PASSWORD })) {
                try {
                    const identifier = value.identifier.trim();
                    await request.mutateAsync({ identifier });

                    onContinue(identifier, PasswordRecoveryStep.OTP);
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
