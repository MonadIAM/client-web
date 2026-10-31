import { Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useNotificationEmailForm } from "../../model/notifications/use-notification-email.form";

export function NotificationEmailAddress(props: NotificationSettingsView.Email.AddressProps) {
    const { t } = useTranslation();
    const { form, pending } = useNotificationEmailForm(props);

    return (
        <Form form={form} aria-label={t("notificationSettings.deliveryEmail")}>
            <Form.Fields>
                <Field.Select
                    form={form}
                    name="identifier"
                    label={t("notificationSettings.deliveryEmail")}
                    reserveErrorSpace={false}
                    disabled={props.disabled || pending || props.emails.length === 0}
                    options={props.emails.map((item) => ({ value: item.id, label: item.identity }))}
                />
            </Form.Fields>
        </Form>
    );
}
