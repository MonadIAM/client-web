import { ButtonVariant, FieldType, FormAlignment, FormDirection, FormSpacing } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useSecurityRemoveForm } from "../../model/security/use-security-remove.form";
import { SecurityAuthentication } from "../../model/security/enums";
import { securityStyles } from "./styles";

export function SecurityRemoveForm(props: Security.Remove.Props) {
    const { t } = useTranslation();
    const { form, method, pending, authenticated } = useSecurityRemoveForm(props);

    return (
        <Form form={form} aria-label={props.title}>
            <Form.Fields disabled={authenticated} className={securityStyles.fields}>
                <Warning title={props.subject}>{props.description}</Warning>
                <Field.Select
                    reserveErrorSpace={false}
                    form={form}
                    name="method"
                    label={t("security.authentication")}
                    options={[
                        {
                            value: SecurityAuthentication.PASSWORD,
                            label: t("auth.password"),
                        },
                        {
                            value: SecurityAuthentication.SECOND_FACTOR,
                            label: t("secondFactor.title"),
                        },
                    ]}
                />
                {method === SecurityAuthentication.PASSWORD && (
                    <Field.Text
                        reserveErrorSpace={false}
                        form={form}
                        name="password"
                        type={FieldType.PASSWORD}
                        label={t("auth.password")}
                        showPasswordLabel={t("auth.showPassword")}
                        hidePasswordLabel={t("auth.hidePassword")}
                        autoComplete="current-password"
                        required
                    />
                )}
                {method === SecurityAuthentication.SECOND_FACTOR && (
                    <Field.Code
                        reserveErrorSpace={false}
                        form={form}
                        name="code"
                        length={6}
                        label={t("auth.code")}
                        autoComplete="one-time-code"
                        className={securityStyles.code}
                        required
                    />
                )}
            </Form.Fields>
            <Form.Actions
                direction={FormDirection.HORIZONTAL}
                align={FormAlignment.END}
                spacing={FormSpacing.LARGE}
                gap={FormSpacing.SMALL}
                className={securityStyles.footer}>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button
                    type="submit"
                    loading={pending}
                    variant={authenticated ? ButtonVariant.DESTRUCTIVE : ButtonVariant.DEFAULT}>
                    {authenticated ? props.title : t("security.authenticate")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
