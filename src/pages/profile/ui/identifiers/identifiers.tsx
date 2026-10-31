import { BadgeTone, ButtonSize, TextTone } from "@monadiam/ui-kit/enums";
import { Badge, Button, List, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { useIdentifiersQuery } from "../../model/identifiers/use-identifiers.query";
import { IdentifierDialogMode } from "../../model/identifiers/enums";
import { IdentifierContent } from "./identifier-content";
import { IdentifierActions } from "./identifier-actions";
import { IdentifierPublic } from "./identifier-public";
import { IdentifierDialog } from "./identifier-dialog";
import { securityStyles } from "../security/styles";
import { ProfileDate } from "../profile-date";

export function Identifiers() {
    const { t } = useTranslation();
    const query = useIdentifiersQuery();

    const [dialog, setDialog] = useState<Nullable<Identifiers.DialogState>>(null);

    const identifiers = query.isError ? [] : (query.data ?? []);

    return (
        <Section
            className={securityStyles.section}
            title={t("identifiers.title")}
            actions={
                <Fragment>
                    <Button
                        size={ButtonSize.SMALL}
                        disabled={query.isError || query.isPending}
                        onClick={() => setDialog({ mode: IdentifierDialogMode.ADD })}>
                        {t("identifiers.add")}
                    </Button>
                    {query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />}
                </Fragment>
            }>
            <List.Columns
                maxHeight={365}
                estimateSize={73}
                label={t("identifiers.title")}
                empty={
                    <Fragment>
                        {query.isError && <QueryError cause={query.error} fallback={t("identifiers.loadError")} />}
                        {query.isPending && (
                            <Text.Span role="status" tone={TextTone.MUTED}>
                                {t("common.loading")}
                            </Text.Span>
                        )}
                        {query.isSuccess && t("identifiers.empty")}
                    </Fragment>
                }
                columns={[
                    {
                        id: "identity",
                        label: t("identifiers.identity"),
                        width: "minmax(0, 1fr)",
                    },
                    {
                        id: "status",
                        label: t("profile.status"),
                        width: "9rem",
                    },
                    {
                        id: "public",
                        label: t("identifiers.public"),
                        width: "5rem",
                    },
                    {
                        id: "createdAt",
                        label: t("identifiers.createdAt"),
                        width: "6rem",
                    },
                    {
                        id: "verifiedAt",
                        label: t("identifiers.verifiedAt"),
                        width: "6rem",
                    },
                    {
                        id: "actions",
                        label: t("identifiers.actionsTitle"),
                        width: "4rem",
                        className: securityStyles.actions,
                    },
                ]}
                items={identifiers.map((identifier) => ({
                    id: identifier.id,
                    cells: {
                        identity: <IdentifierContent identifier={identifier} />,
                        status: (
                            <Badge tone={identifier.isVerified ? BadgeTone.SUCCESS : BadgeTone.WARNING}>
                                {identifier.isVerified ? t("identifiers.verified") : t("identifiers.pending")}
                            </Badge>
                        ),
                        public: <IdentifierPublic identifier={identifier} />,
                        createdAt: <ProfileDate value={identifier.createdAt} />,
                        verifiedAt: <ProfileDate value={identifier.verifiedAt} />,
                        actions: (
                            <IdentifierActions
                                identifier={identifier}
                                onVerify={() =>
                                    setDialog({
                                        mode: IdentifierDialogMode.VERIFY,
                                        identity: identifier.identity,
                                    })
                                }
                                onRemove={() =>
                                    setDialog({
                                        mode: IdentifierDialogMode.REMOVE,
                                        isVerified: identifier.isVerified,
                                        identity: identifier.identity,
                                        id: identifier.id,
                                    })
                                }
                            />
                        ),
                    },
                }))}
            />
            {dialog && <IdentifierDialog state={dialog} onChange={setDialog} onClose={() => setDialog(null)} />}
        </Section>
    );
}
