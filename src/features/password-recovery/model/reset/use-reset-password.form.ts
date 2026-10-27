import { useForm, useSelector } from "@monadiam/ui-kit";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { IdentitySchemas } from "~shared/api/schemas";

import { useResetPasswordQuery } from "./use-reset-password.query";
import { PasswordRecoveryStep } from "../steps";

export function useResetPasswordForm({ identifier, method, onComplete }: PasswordRecovery.Reset.Props) {
    const request = useResetPasswordQuery(method);

    const schema =
        method === PasswordRecoveryStep.OTP
            ? IdentitySchemas.zPasswordResetByOtpBody
            : IdentitySchemas.zPasswordResetByRecoveryCodeBody;

    const form = useForm({
        defaultValues: { identifier, code: "", password: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                await request.mutateAsync({
                    ...value,
                    identifier: value.identifier.trim(),
                    code: value.code.trim(),
                });
                formApi.reset();
                onComplete();
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "code", "password"],
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

    return { form, isSubmitting, schema };
}
