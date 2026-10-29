import { FormAlignment, FormDirection, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Field, Form, Section } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

import { Language } from "~shared/i18n";

import { useNotificationRegionForm } from "../../model/notifications/use-notification-region.form";
import { TimeZoneManager } from "../../lib/time-zone.manager";
import { notificationStyles } from "./styles";

export function NotificationRegion({ recipient }: NotificationSettingsView.Region.Props) {
    const { t, i18n } = useTranslation();
    const { form, isSubmitting, canSubmit } = useNotificationRegionForm(recipient);
    const locale = i18n.resolvedLanguage ?? Language.EN;
    const current = recipient.timezone;
    const zones = useMemo(() => TimeZoneManager.getOptions({ locale, current }), [locale, current]);

    return (
        <Section title={t("notificationSettings.region")}>
            <Form form={form} aria-label={t("notificationSettings.region")}>
                <Form.Fields className={notificationStyles.fields}>
                    <Field.Select
                        form={form}
                        name="locale"
                        label={t("notificationSettings.locale")}
                        reserveErrorSpace={false}
                        disabled={isSubmitting}
                        options={[
                            { value: Language.RU, label: "Русский" },
                            { value: Language.EN, label: "English" },
                        ]}
                    />
                    <Field.Select
                        form={form}
                        name="timezone"
                        label={t("profile.timeZone")}
                        reserveErrorSpace={false}
                        disabled={isSubmitting}
                        options={zones}
                        searchable
                        searchLabel={t("profile.searchTimeZone")}
                        emptyLabel={t("profile.noTimeZones")}
                    />
                </Form.Fields>
                <Form.Actions direction={FormDirection.HORIZONTAL} align={FormAlignment.END} spacing={FormSpacing.LARGE}>
                    <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
                        {t("common.save")}
                    </Button>
                </Form.Actions>
            </Form>
        </Section>
    );
}
