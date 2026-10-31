import { ButtonVariant, FormAlignment, FormDirection, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Form, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useSecurityConfirmationForm } from "../../model/security/use-security-confirmation.form";
import { securityStyles } from "./styles";

export function SecurityActionConfirmation(props: Security.Action.Props & Security.Action.Operation) {
    const { t } = useTranslation();
    const { form, pending } = useSecurityConfirmationForm(props);

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
