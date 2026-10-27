import { ButtonVariant, FormSpacing, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Field, Flex, Form, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useIdentifierVerifyForm } from "../../model/identifiers/use-identifier-verify.form";
import { securityStyles } from "../security/styles";
import { identifierStyles } from "./styles";

export function IdentifierVerifyForm(props: Identifiers.Verify.Props) {
    const { t } = useTranslation();
    const { form, pending, remaining, resendRequest } = useIdentifierVerifyForm(props);

    return (
        <Form form={form} aria-label={t("identifiers.verifyTitle")}>
            <Form.Fields disabled={resendRequest.isPending} className={securityStyles.fields}>
                <Flex.Col gap="0.25rem">
                    <Text.P tone={TextTone.MUTED}>{t("identifiers.codeDescription")}</Text.P>
                    <Text.P className={identifierStyles.identity}>{props.identity}</Text.P>
                </Flex.Col>
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
            </Form.Fields>
            <Form.Actions spacing={FormSpacing.LARGE} gap={FormSpacing.SMALL}>
                <Button type="submit" loading={pending} disabled={resendRequest.isPending}>
                    {t("identifiers.verify")}
                </Button>
                <Button
                    variant={ButtonVariant.OUTLINE}
                    disabled={remaining > 0 || pending}
                    loading={resendRequest.isPending}
                    onClick={() => resendRequest.mutate()}>
                    {remaining > 0 ? t("otp.retryIn", { seconds: remaining }) : t("auth.resend")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
