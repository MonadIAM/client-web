import { useForm, useSelector } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { getValidationErrors } from "~shared/api/validation";
import { NotificationManager } from "~shared/notifications";
import { Language } from "~shared/i18n";

import { useProfileQuery } from "./use-profile.query";

export function useProfileForm(account: Auth.Account.Details) {
    const { t, i18n } = useTranslation();
    const request = useProfileQuery();

    const [savedValues, setSavedValues] = useState(() => ({
        displayName: account.profile?.displayName ?? "",
        timeZone: account.profile?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: account.profile?.locale ?? i18n.resolvedLanguage ?? Language.EN,
    }));

    const hasChanges = (value: typeof savedValues) =>
        value.displayName.trim() !== savedValues.displayName.trim() ||
        value.timeZone.trim() !== savedValues.timeZone.trim() ||
        value.locale !== savedValues.locale;

    const form = useForm({
        defaultValues: savedValues,

        onSubmit: async ({ value, formApi }) => {
            const body = {
                ...value,
                displayName: value.displayName.trim(),
                timeZone: value.timeZone.trim(),
            };

            try {
                await request.mutateAsync(body);

                setSavedValues(body);
                formApi.reset(body);

                NotificationManager.success({ title: t("profile.saved") });
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["displayName", "timeZone", "locale"],
                });

                if (fields && !fields.locale) {
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
        (state) => state.canSubmit && !state.isSubmitting && hasChanges(state.values),
    );

    return { form, isSubmitting, canSubmit };
}
