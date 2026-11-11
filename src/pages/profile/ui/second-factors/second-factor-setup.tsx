import { TextTone } from "@monadiam/ui-kit/enums";
import { Dialog, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { useSecondFactorSetupQuery } from "../../model/second-factors/use-second-factor-setup.query";
import { SecondFactorVerifyForm } from "./second-factor-verify-form";

export function SecondFactorSetup(props: SecondFactors.SetupPanel.Props) {
    const { t } = useTranslation();
    const query = useSecondFactorSetupQuery(props);

    const setup = props.setup ?? query.data;

    const retry = query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />;

    return (
        <Flex.Col>
            {query.isError && <QueryError cause={query.error} fallback={t("secondFactors.setupError")} />}
            {!query.isError && setup && <SecondFactorVerifyForm setup={setup} onVerified={props.onVerified} />}
            {!setup && !query.isError && (
                <Text.P role="status" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
            {query.isError && <Dialog.Actions>{retry}</Dialog.Actions>}
        </Flex.Col>
    );
}
