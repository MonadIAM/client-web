import { ButtonSize, ButtonVariant, TextTone } from "@monadiam/ui-kit/enums";
import { Button, List, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";
import { useSession } from "~shared/auth";

import { useSessionsQuery } from "../../model/sessions/use-sessions.query";
import { SessionRevokeMode } from "../../model/sessions/enums";
import { SessionRevokeDialog } from "./session-revoke-dialog";
import { securityStyles } from "../security/styles";
import { SessionContent } from "./session-content";
import { ProfileLayout } from "../profile-layout";
import { ProfileDate } from "../profile-date";
import { sessionStyles } from "./styles";

export function Sessions() {
    const { t } = useTranslation();
    const session = useSession();
    const query = useSessionsQuery();

    const [selected, setSelected] = useState<Nullable<Sessions.Revoke.Target>>(null);

    const currentId = session.claims?.sid ?? "";
    const sessions = query.isError ? [] : (query.data ?? []);

    return (
        <ProfileLayout title={t("sessions.title")}>
            <Section
                className={securityStyles.section}
                title={t("sessions.active")}
                actions={
                    <Fragment>
                        <Button
                            size={ButtonSize.SMALL}
                            disabled={!currentId || query.isPending || query.isError}
                            onClick={() => setSelected({ mode: SessionRevokeMode.ALL })}>
                            {t("sessions.revokeAll")}
                        </Button>
                        {query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />}
                    </Fragment>
                }>
                <List.Columns
                    maxHeight={584}
                    estimateSize={73}
                    label={t("sessions.active")}
                    empty={
                        <Fragment>
                            {query.isError && <QueryError cause={query.error} fallback={t("sessions.loadError")} />}
                            {query.isPending && (
                                <Text.Span role="status" tone={TextTone.MUTED}>
                                    {t("common.loading")}
                                </Text.Span>
                            )}
                            {query.isSuccess && t("sessions.empty")}
                        </Fragment>
                    }
                    columns={[
                        {
                            id: "device",
                            label: t("sessions.device"),
                            width: "minmax(0, 1fr)",
                        },
                        {
                            id: "ip",
                            label: t("sessions.ip"),
                            width: "9rem",
                        },
                        {
                            id: "createdAt",
                            label: t("sessions.createdAt"),
                            width: "6rem",
                        },
                        {
                            id: "updatedAt",
                            label: t("sessions.updatedAt"),
                            width: "6rem",
                        },
                        {
                            id: "actions",
                            label: t("sessions.actions"),
                            width: "7rem",
                            className: securityStyles.actions,
                        },
                    ]}
                    items={sessions.map((item) => ({
                        id: item.id,
                        cells: {
                            device: <SessionContent session={item} current={item.id === currentId} />,
                            ip: <Text.Span className={sessionStyles.ip}>{item.ip ?? "—"}</Text.Span>,
                            createdAt: <ProfileDate value={item.createdAt} />,
                            updatedAt: <ProfileDate value={item.lastRefreshedAt ?? undefined} />,
                            actions: (
                                <Button
                                    size={ButtonSize.SMALL}
                                    variant={ButtonVariant.DESTRUCTIVE}
                                    disabled={!currentId || query.isError}
                                    aria-label={t("sessions.revokeLabel", {
                                        agent: item.userAgent || t("sessions.unknownBrowser"),
                                        ip: item.ip ?? "—",
                                    })}
                                    onClick={() =>
                                        setSelected({
                                            mode: SessionRevokeMode.SINGLE,
                                            session: item,
                                        })
                                    }>
                                    {t("sessions.revoke")}
                                </Button>
                            ),
                        },
                    }))}
                />
                {selected && (
                    <SessionRevokeDialog target={selected} currentId={currentId} onClose={() => setSelected(null)} />
                )}
            </Section>
        </ProfileLayout>
    );
}
