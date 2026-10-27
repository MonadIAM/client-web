import { ButtonVariant, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useSecondFactorSetupQuery } from "../../model/second-factors/use-second-factor-setup.query";
import { SecondFactorVerifyForm } from "./second-factor-verify-form";

export function SecondFactorSetup(props: SecondFactors.SetupPanel.Props) {
    const { t } = useTranslation();
    const query = useSecondFactorSetupQuery(props);

    const setup = props.setup ?? query.data;

    if (setup) {
        return <SecondFactorVerifyForm setup={setup} onVerified={props.onVerified} />;
    }

    return (
        <Flex.Col gap="0.75rem">
            {query.isError ? (
                <Text.P role="alert" tone={TextTone.DANGER}>
                    {t("secondFactors.setupError")}
                </Text.P>
            ) : (
                <Text.P role="status" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
            {query.isError && (
                <Button variant={ButtonVariant.OUTLINE} loading={query.isFetching} onClick={() => void query.refetch()}>
                    {t("common.retry")}
                </Button>
            )}
        </Flex.Col>
    );
}
