import { ButtonVariant, FormAlignment, FormDirection, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Form, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { securityStyles } from "./styles";

export function SecurityActionConfirmation({ form, pending, ...props }: Security.Action.ConfirmationProps) {
    const { t } = useTranslation();

    return (
        <Form form={form} aria-label={props.title}>
            <Warning title={props.subject}>{props.description}</Warning>
            <Form.Actions
                direction={FormDirection.HORIZONTAL}
                align={FormAlignment.END}
                spacing={FormSpacing.LARGE}
                gap={FormSpacing.SMALL}
                className={securityStyles.footer}>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={pending} variant={ButtonVariant.DESTRUCTIVE}>
                    {props.title}
                </Button>
            </Form.Actions>
        </Form>
    );
}
