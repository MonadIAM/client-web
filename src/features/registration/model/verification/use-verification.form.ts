import { useForm, useSelector } from "@monadiam/ui-kit";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { CooldownOTP, useCooldownOTP } from "~shared/auth";
import { IdentitySchemas } from "~shared/api/schemas";
import { OTPFlow } from "~shared/auth/otp";

import { useResendVerificationQuery } from "./use-resend-verification.query";
import { useVerificationQuery } from "./use-verification.query";

export function useVerificationForm({ identifier, onVerified }: Signup.Verification.Props) {
    const request = useVerificationQuery();
    const remaining = useCooldownOTP({ flow: OTPFlow.SIGNUP });
    const resendRequest = useResendVerificationQuery();

    const form = useForm({
        defaultValues: { identifier, code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await request.mutateAsync({
                    identifier: value.identifier.trim(),
                    code: value.code.trim(),
                });
                onVerified(response.codes);
                formApi.reset();
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

    async function resend(): Promise<void> {
        if (!CooldownOTP.remaining({ flow: OTPFlow.SIGNUP })) {
            const parsed = IdentitySchemas.zAccountResendVerificationBody.shape.identifier.safeParse(
                form.state.values.identifier.trim(),
            );
            if (parsed.success) {
                try {
                    await resendRequest.mutateAsync({ identifier: parsed.data });
                } catch (cause) {
                    const fields = getValidationErrors({
                        cause,
                        fields: ["identifier"],
                    });
                    if (fields) {
                        form.setErrorMap({ onSubmit: { fields } });
                    } else {
                        NotificationManager.error({ cause });
                    }
                }
            } else {
                form.setErrorMap({
                    onSubmit: {
                        fields: { identifier: parsed.error.issues[0]?.message },
                    },
                });
            }
        }
    }

    return { form, isSubmitting, remaining, resending: resendRequest.isPending, resend };
}
