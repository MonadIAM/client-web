import {
    FlexJustification,
    ButtonVariant,
    FieldType,
    FormAlignment,
    FormDirection,
    FormSpacing,
} from "@monadiam/ui-kit/enums";
import { Button, Dialog, Field, Form, Warning, Text, Flex } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { useSecurityActionForm } from "../../model/security/use-security-action.form";
import { SecurityActionConfirmation } from "./security-action-confirmation";
import { useSecurityQuery } from "../../model/security/use-security.query";
import { SecurityAuthentication } from "../../model/security/enums";
import { securityStyles } from "./styles";

export function SecurityActionForm(props: Security.Action.Props) {
    if (!props.authenticateOnly && props.reauthenticate === false) {
        return <SecurityActionConfirmation {...props} />;
    } else {
        return <SecurityActionAuthentication {...props} />;
    }
}

function SecurityActionAuthentication(props: Security.Action.Props) {
    const { t } = useTranslation();
    const query = useSecurityQuery();
    const retry = query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />;

    return (
        <Flex.Col gap="0.75rem">
            {query.isError && <QueryError cause={query.error} fallback={t("security.loadError")} />}
            {!query.isError && query.data && <SecurityActionFields {...props} security={query.data} />}
            {!query.data && !query.isError && <Text.P role="status">{t("common.loading")}</Text.P>}
            {query.isError && (
                <Flex.Row justify={FlexJustification.END} gap="0.5rem" className={securityStyles.footer}>
                    <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />}>{t("common.cancel")}</Dialog.Close>
                    {retry}
                </Flex.Row>
            )}
        </Flex.Col>
    );
}

function SecurityActionFields(props: Security.Action.FieldsProps) {
    const { t } = useTranslation();
    const { form, method, pending, authenticated, remaining, sendCode, sendingCode } = useSecurityActionForm(props);
    const methods: Security.Action.MethodOption[] = [];
    if (props.security.hasPassword) {
        methods.push({
            value: SecurityAuthentication.PASSWORD,
            label: t("auth.password"),
        });
    }
    if (props.security.hasSecondFactor) {
        methods.push({
            value: SecurityAuthentication.SECOND_FACTOR,
            label: t("secondFactor.title"),
        });
    }
    if (props.security.canConfirmByEmail) {
        methods.push({
            value: SecurityAuthentication.EMAIL,
            label: t("dangerZone.emailConfirmation"),
        });
    }

    const availableMethods = props.method ? methods.filter((option) => option.value === props.method) : methods;

    if (!availableMethods.length) {
        return <Warning title={props.title}>{t("dangerZone.noConfirmationMethod")}</Warning>;
    }

    return (
        <Form form={form} aria-label={props.title}>
            <Form.Fields disabled={authenticated || pending || sendingCode} className={securityStyles.fields}>
                <Warning title={props.subject}>{props.description}</Warning>
                {!props.method && (
                    <Field.Select
                        reserveErrorSpace={false}
                        form={form}
                        name="method"
                        label={t("security.authentication")}
                        options={availableMethods}
                    />
                )}
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
                {method === SecurityAuthentication.EMAIL && (
                    <Button
                        type="button"
                        variant={ButtonVariant.OUTLINE}
                        disabled={remaining > 0}
                        loading={sendingCode}
                        onClick={() => void sendCode()}>
                        {remaining > 0 ? t("otp.retryIn", { seconds: remaining }) : t("dangerZone.sendCode")}
                    </Button>
                )}
                {method !== SecurityAuthentication.PASSWORD && (
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
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={pending || sendingCode}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button
                    type="submit"
                    disabled={sendingCode}
                    loading={pending}
                    variant={authenticated ? ButtonVariant.DESTRUCTIVE : ButtonVariant.DEFAULT}>
                    {authenticated ? props.title : t("security.authenticate")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
