import { ButtonVariant, FlexAlignment, FormSpacing, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Field, Flex, Form, QRCode, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useProfileCopy } from "../../model/use-profile-copy";
import { SecondFactorManager } from "../../model/second-factors/second-factor.manager";
import { useSecondFactorVerifyForm } from "../../model/second-factors/use-second-factor-verify.form";
import { securityStyles } from "../security/styles";

export function SecondFactorVerifyForm(props: SecondFactors.Verify.Props) {
    const { t } = useTranslation();
    const { form, pending } = useSecondFactorVerifyForm(props);

    const secret = SecondFactorManager.secret({ uri: props.setup.uri });
    const { copied, copy } = useProfileCopy({ value: secret });

    return (
        <Form form={form} aria-label={t("secondFactors.verifyTitle")}>
            <Form.Fields className={securityStyles.fields}>
                <Flex.Col gap="1rem">
                    <Text.P tone={TextTone.MUTED}>{t("secondFactors.setupDescription")}</Text.P>
                    <Flex.Col align={FlexAlignment.CENTER}>
                        <QRCode value={props.setup.uri} label={t("secondFactors.qrCode")} />
                    </Flex.Col>
                    <Button variant={ButtonVariant.OUTLINE} onClick={() => void copy()}>
                        {copied ? t("common.copied") : t("secondFactors.copyKey")}
                    </Button>
                </Flex.Col>
                <Field.Code
                    form={form}
                    name="code"
                    label={t("auth.code")}
                    length={6}
                    reserveErrorSpace={false}
                    className={securityStyles.code}
                    autoComplete="one-time-code"
                    required
                />
            </Form.Fields>
            <Form.Actions spacing={FormSpacing.LARGE}>
                <Button type="submit" loading={pending}>
                    {t("identifiers.verify")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
