import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { NotificationManager } from "~shared/notifications";

import { SecurityManager } from "./security.manager";

export function useSecurityConfirmationForm({ action, mutationKey, successMessage, onComplete }: Security.Action.Props) {
    const [authenticationRequired, setAuthenticationRequired] = useState(false);
    const request = useMutation({ mutationKey, mutationFn: action, gcTime: 0 });
    const form = useForm({
        defaultValues: {},
        onSubmit: async () => {
            try {
                await request.mutateAsync();

                if (successMessage) {
                    NotificationManager.success({ title: successMessage });
                }

                onComplete?.();
            } catch (cause) {
                if (SecurityManager.requiresReauthentication({ cause })) {
                    setAuthenticationRequired(true);
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });
    const pending = useSelector(form.store, (state) => state.isSubmitting);

    const authenticate = async () => {
        setAuthenticationRequired(false);
        await form.handleSubmit();
    };

    return { form, pending, authenticationRequired, authenticate };
}
