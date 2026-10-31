import { ButtonVariant, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { securityStyles } from "../security/styles";
import { useSecondFactorSetupQuery } from "../../model/second-factors/use-second-factor-setup.query";
import { SecondFactorVerifyForm } from "./second-factor-verify-form";

export function SecondFactorSetup(props: SecondFactors.SetupPanel.Props) {
    const { t } = useTranslation();
    const query = useSecondFactorSetupQuery(props);

    const setup = props.setup ?? query.data;

    const retry = query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />;

    return (
        <Flex.Col gap="0.75rem">
            {query.isError && <QueryError cause={query.error} fallback={t("secondFactors.setupError")} />}
            {!query.isError && setup && <SecondFactorVerifyForm setup={setup} onVerified={props.onVerified} />}
            {!setup && !query.isError && (
                <Text.P role="status" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
            {query.isError && (
                <Flex.Row justify={FlexJustification.END} gap="0.5rem" className={securityStyles.footer}>
                    <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />}>{t("common.cancel")}</Dialog.Close>
                    {retry}
                </Flex.Row>
            )}
        </Flex.Col>
    );
}
