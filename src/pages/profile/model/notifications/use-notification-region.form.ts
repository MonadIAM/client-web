import { useForm, useSelector } from "@monadiam/ui-kit";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { useSession } from "~shared/auth";

import { NotificationSettingsManager } from "./notification-settings.manager";
import { notificationSettingsQueryKey } from "./use-notification-settings";

export function useNotificationRegionForm(recipient: NotificationSettings.Recipient) {
    const { t } = useTranslation();
    const session = useSession();
    const queryClient = useQueryClient();
    const [savedValues, setSavedValues] = useState<NotificationSettings.Region>(() => ({
        locale: recipient.locale,
        timezone: recipient.timezone,
    }));

    const form = useForm({
        defaultValues: savedValues,

        onSubmit: async ({ value, formApi }) => {
            const body: API.Notification.RecipientUpdateBody = {};

            if (value.locale !== savedValues.locale) {
                body.locale = value.locale;
            }

            if (value.timezone !== savedValues.timezone) {
                body.timezone = value.timezone;
            }

            try {
                await NotificationSettingsManager.updateRegion(body);

                setSavedValues(value);
                formApi.reset(value);

                NotificationManager.success({ title: t("notificationSettings.saved") });

                void queryClient.invalidateQueries({ queryKey: [...notificationSettingsQueryKey, session.revision] });
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["locale", "timezone"] });

                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
    const canSubmit = useSelector(
        form.store,
        (state) =>
            state.canSubmit &&
            !state.isSubmitting &&
            (state.values.locale !== savedValues.locale || state.values.timezone !== savedValues.timezone),
    );

    return { form, isSubmitting, canSubmit };
}
