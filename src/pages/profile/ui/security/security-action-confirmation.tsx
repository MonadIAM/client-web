import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Form, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

export function SecurityActionConfirmation({ form, pending, ...props }: Security.Action.ConfirmationProps) {
    const { t } = useTranslation();

    return (
        <Form form={form} aria-label={props.title}>
            <Warning title={props.subject}>{props.description}</Warning>
            <Dialog.Actions>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending} variant={ButtonVariant.DESTRUCTIVE}>
                    {props.actionLabel}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
