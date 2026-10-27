import { useForm, useField, useSelector } from "@monadiam/ui-kit";
import { ThemeMode } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { NotificationManager } from "~shared/notifications";
import { ThemeManager } from "~shared/theme";
import { Language } from "~shared/i18n";

export function useAppearanceForm({ onClose }: Appearance.FormProps) {
    const { i18n } = useTranslation();

    const [initial] = useState(() => ({
        language: i18n.resolvedLanguage ?? Language.EN,
        theme: ThemeManager.getPreference() ?? "system",
    }));

    const form = useForm({
        defaultValues: initial,

        onSubmit: async ({ value }) => {
            try {
                if (value.language !== initial.language) {
                    await i18n.changeLanguage(value.language);
                }

                if (value.theme !== initial.theme) {
                    ThemeManager.setPreference({
                        mode: Object.values(ThemeMode).find((mode) => mode === value.theme),
                    });
                }

                onClose();
            } catch (cause) {
                NotificationManager.error({ cause });
            }
        },
    });

    const theme = useField({ form, name: "theme" });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
    const canSubmit = useSelector(
        form.store,
        (state) =>
            state.canSubmit &&
            !state.isSubmitting &&
            (state.values.language !== initial.language || state.values.theme !== initial.theme),
    );

    return { form, theme, isSubmitting, canSubmit };
}
