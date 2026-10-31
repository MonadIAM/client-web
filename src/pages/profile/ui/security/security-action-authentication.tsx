import { Button, Dialog, Field, Form, Warning, Text, Flex } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import {
    FlexJustification,
    ButtonVariant,
    FormAlignment,
    FormDirection,
    FormSpacing,
    FieldType,
} from "@monadiam/ui-kit/enums";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { useSecurityActionForm } from "../../model/security/use-security-action.form";
import { useSecurityQuery } from "../../model/security/use-security.query";
import { SecurityAuthentication } from "../../model/security/enums";
import { securityStyles } from "./styles";

export function SecurityActionAuthentication(props: Security.Action.AuthenticationProps) {
    const { t } = useTranslation();
    const labels = {
        [SecurityAuthentication.PASSWORD]: t("auth.password"),
        [SecurityAuthentication.SECOND_FACTOR]: t("secondFactor.title"),
        [SecurityAuthentication.EMAIL]: t("dangerZone.emailConfirmation"),
    };

    if (props.method) {
        return <SecurityActionFields {...props} methods={[{ value: props.method, label: labels[props.method] }]} />;
    } else {
        return <SecurityActionMethods {...props} />;
    }
}

function SecurityActionMethods(props: Security.Action.AuthenticationProps) {
    const { t } = useTranslation();
    const query = useSecurityQuery();
    const methods: Security.Action.MethodOption[] = [];
    if (query.data?.hasPassword) {
        methods.push({
            value: SecurityAuthentication.PASSWORD,
            label: t("auth.password"),
        });
    }
    if (query.data?.hasSecondFactor) {
        methods.push({
            value: SecurityAuthentication.SECOND_FACTOR,
            label: t("secondFactor.title"),
        });
    }
    if (query.data?.canConfirmByEmail) {
        methods.push({
            value: SecurityAuthentication.EMAIL,
            label: t("dangerZone.emailConfirmation"),
        });
    }

    const retry = query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />;

    return (
        <Flex.Col gap="0.75rem">
            {query.isError && <QueryError cause={query.error} fallback={t("security.loadError")} />}
            {!query.isError && query.data && <SecurityActionFields {...props} methods={methods} />}
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
    const { form, method, pending, remaining, sendCode, sendingCode } = useSecurityActionForm(props);
    if (!props.methods.length) {
        return <Warning title={props.title}>{t("dangerZone.noConfirmationMethod")}</Warning>;
    }

    return (
        <Form form={form} aria-label={props.title}>
            <Form.Fields disabled={pending || sendingCode} className={securityStyles.fields}>
                <Warning title={props.subject}>{props.description}</Warning>
                {!props.method && (
                    <Field.Select
                        reserveErrorSpace={false}
                        form={form}
                        name="method"
                        label={t("security.authentication")}
                        options={props.methods}
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
                <Button type="submit" disabled={sendingCode} loading={pending} variant={ButtonVariant.DEFAULT}>
                    {t("security.authenticate")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
