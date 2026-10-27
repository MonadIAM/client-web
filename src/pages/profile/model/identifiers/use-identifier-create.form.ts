import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { CooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";
import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { IdentifierType } from "~shared/api/generated/identity";

import { identifierMutationKey } from "./use-identifiers.query";
import { IdentifierManager } from "./identifier.manager";
import { useIdentifierRefresh } from "./use-identifier-refresh";
import { IdentifierSchema } from "./schema";

export function useIdentifierCreateForm({ onCreated }: Identifiers.Create.Props) {
    const { t } = useTranslation();
    const refresh = useIdentifierRefresh();

    const request = useMutation({
        mutationKey: identifierMutationKey,
        mutationFn: IdentifierManager.create,
    });

    const defaultValues: Identifiers.Draft = {
        identifier: "",
        type: IdentifierType.EMAIL,
    };

    const form = useForm({
        defaultValues,

        validators: {
            onSubmit: ({ value }) => {
                const schema = value.type === IdentifierType.EMAIL ? IdentifierSchema.email : IdentifierSchema.phone;

                if (!schema.safeParse(value.identifier.trim()).success) {
                    return {
                        fields: {
                            identifier: t(`identifiers.invalid.${value.type}`),
                        },
                    };
                }

                return undefined;
            },
        },

        onSubmit: async ({ value, formApi }) => {
            const identity = value.identifier.trim();

            try {
                await request.mutateAsync({ ...value, identifier: identity });

                CooldownOTP.start({ flow: OTPFlow.IDENTIFIER });
                void refresh();

                onCreated(identity);
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
        },
    });

    const type = useSelector(form.store, (state) => state.values.type);
    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, type, pending };
}
