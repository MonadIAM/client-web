import { useForm, useSelector } from "@monadiam/ui-kit";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";

import { useRegistrationQuery } from "./use-registration.query";

export function useRegistrationForm({ identifier, onContinue }: Signup.Registration.Props) {
    const request = useRegistrationQuery();
    const form = useForm({
        defaultValues: { name: "", identifier, password: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const identifier = value.identifier.trim();
                await request.mutateAsync({ ...value, identifier, name: value.name.trim() });

                formApi.reset();
                onContinue(identifier);
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["name", "identifier", "password"],
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
