import { BadgeTone, ButtonSize, ButtonVariant, TextTone } from "@monadiam/ui-kit/enums";
import { Badge, Button, Flex, List, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { useSecondFactorsQuery } from "../../model/second-factors/use-second-factors.query";
import { SecondFactorDialogMode } from "../../model/second-factors/enums";
import { SecondFactorActions } from "./second-factor-actions";
import { SecondFactorDialog } from "./second-factor-dialog";
import { securityStyles } from "../security/styles";
import { ProfileDate } from "../profile-date";

export function SecondFactors() {
    const { t } = useTranslation();
    const query = useSecondFactorsQuery();

    const [dialog, setDialog] = useState<Nullable<SecondFactors.DialogState>>(null);

    return (
        <Section
            title={t("secondFactors.title")}
            className={securityStyles.section}
            actions={
                <Button size={ButtonSize.SMALL} onClick={() => setDialog({ mode: SecondFactorDialogMode.ADD })}>
                    {t("secondFactors.add")}
                </Button>
            }>
            {query.isPending && (
                <Text.P role="status" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
            {query.isError && (
                <Flex.Col gap="0.75rem">
                    <Text.P role="alert" tone={TextTone.DANGER}>
                        {t("secondFactors.loadError")}
                    </Text.P>
                    <Button variant={ButtonVariant.OUTLINE} loading={query.isFetching} onClick={() => void query.refetch()}>
                        {t("common.retry")}
                    </Button>
                </Flex.Col>
            )}
            {query.data && (
                <List.Columns
                    maxHeight={365}
                    estimateSize={73}
                    label={t("secondFactors.title")}
                    empty={t("secondFactors.empty")}
                    columns={[
                        { id: "name", label: t("secondFactors.name") },
                        { id: "status", label: t("profile.status"), width: "9rem" },
                        { id: "type", label: t("secondFactors.type"), width: "5rem" },
                        { id: "createdAt", label: t("identifiers.createdAt"), width: "6rem" },
                        { id: "confirmedAt", label: t("identifiers.verifiedAt"), width: "6rem" },
                        {
                            id: "actions",
                            label: t("identifiers.actionsTitle"),
                            width: "4rem",
                            className: securityStyles.actions,
                        },
                    ]}
                    items={query.data.map((factor) => ({
                        id: factor.id,
                        cells: {
                            name: <Text.Span>{factor.name ?? t("secondFactors.unnamed")}</Text.Span>,
                            status: (
                                <Badge tone={factor.confirmedAt ? BadgeTone.SUCCESS : BadgeTone.WARNING}>
                                    {factor.confirmedAt ? t("identifiers.verified") : t("identifiers.pending")}
                                </Badge>
                            ),
                            type: <Text.Span>{factor.type.toUpperCase()}</Text.Span>,
                            createdAt: <ProfileDate value={factor.createdAt} />,
                            confirmedAt: <ProfileDate value={factor.confirmedAt} />,
                            actions: (
                                <SecondFactorActions
                                    factor={factor}
                                    onVerify={() => setDialog({ mode: SecondFactorDialogMode.VERIFY, factor })}
                                    onRemove={() => setDialog({ mode: SecondFactorDialogMode.REMOVE, factor })}
                                />
                            ),
                        },
                    }))}
                />
            )}
            {dialog && <SecondFactorDialog state={dialog} onChange={setDialog} onClose={() => setDialog(null)} />}
        </Section>
    );
}
