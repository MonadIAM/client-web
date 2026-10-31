import { useForm, useSelector } from "@monadiam/ui-kit";

import { NotificationManager } from "~shared/notifications";

export function useNotificationEmailForm({ channel, emails, onSelect }: NotificationSettings.EmailForm.Props) {
    const form = useForm({
        defaultValues: { identifier: channel?.sourceIdentifier ?? "" },
        listeners: {
            onChange: ({ formApi }) => {
                void formApi.handleSubmit();
            },
        },
        onSubmit: async ({ value, formApi }) => {
            if (value.identifier !== channel?.sourceIdentifier && emails.some((item) => item.id === value.identifier)) {
                try {
                    await onSelect(value.identifier);
                } catch (cause) {
                    formApi.reset();
                    NotificationManager.error({ cause });
                }
            }
        },
    });
    const pending = useSelector(form.store, (state) => state.isSubmitting);

    return { form, pending };
}
