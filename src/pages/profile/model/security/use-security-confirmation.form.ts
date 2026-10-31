import { useForm, useSelector } from "@monadiam/ui-kit";
import { useMutation } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";

export function useSecurityConfirmationForm({
    action,
    mutationKey,
    successMessage,
    onComplete,
}: Security.Action.Props & Security.Action.Operation) {
    const request = useMutation({ mutationKey, mutationFn: action, gcTime: 0 });
    const form = useForm({
        defaultValues: {},
        onSubmit: async () => {
            try {
                await request.mutateAsync();

                if (successMessage) {
                    NotificationManager.success({ title: successMessage });
                }

                onComplete();
            } catch (cause) {
                NotificationManager.error({ cause });
            }
        },
    });
    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending };
}
