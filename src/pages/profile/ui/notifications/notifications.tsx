import { TextTone } from "@monadiam/ui-kit/enums";
import { Flex, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { ChannelType } from "~shared/api/generated/notification";
import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";

import { useNotificationSettings } from "../../model/notifications/use-notification-settings";
import { NotificationRegion } from "./notification-region";
import { NotificationSound } from "./notification-sound";
import { NotificationEmail } from "./notification-email";
import { ProfileLayout } from "../profile-layout";
import { pageStyles } from "../styles";

export function Notifications() {
    const { t } = useTranslation();
    const { query, sound, email, selection, identifiers, emails, channel, hasEmail, disabled } = useNotificationSettings();
    const retry = query.isError && <RetryButton loading={query.isFetching} onClick={() => void query.refetch()} />;
    const error = <QueryError cause={query.error} fallback={t("notificationSettings.loadError")} />;
    const emailError = (
        <QueryError cause={query.error ?? identifiers.error} fallback={t("notificationSettings.loadError")} />
    );
    const loading = (
        <Text.P role="status" aria-busy="true" tone={TextTone.MUTED}>
            {t("common.loading")}
        </Text.P>
    );

    return (
        <ProfileLayout title={t("notificationSettings.title")}>
            <Section title={t("notificationSettings.inApp")} actions={retry} className={pageStyles.section}>
                <Flex.Col className={pageStyles.panel}>
                    {query.isError && error}
                    {query.isPending && loading}
                    {!query.isError && query.data && (
                        <NotificationSound
                            channel={query.data.channels.find((channel) => channel.type === ChannelType.IN_APP)}
                            disabled={disabled}
                            onToggle={() => sound.mutate()}
                        />
                    )}
                </Flex.Col>
            </Section>
            <Section
                title={t("notificationSettings.email")}
                className={pageStyles.section}
                actions={
                    (query.isError || identifiers.isError) && (
                        <RetryButton
                            loading={query.isFetching || identifiers.isFetching}
                            onClick={() => {
                                if (query.isError) {
                                    void query.refetch();
                                }

                                if (identifiers.isError) {
                                    void identifiers.refetch();
                                }
                            }}
                        />
                    )
                }>
                <Flex.Col className={pageStyles.panel}>
                    {(query.isError || identifiers.isError) && emailError}
                    {(query.isPending || identifiers.isPending) && loading}
                    {!query.isError && !identifiers.isError && query.data && (
                        <NotificationEmail
                            preferences={query.data.preferences}
                            channel={channel}
                            emails={emails}
                            hasEmail={hasEmail}
                            disabled={disabled || identifiers.isFetching || identifiers.isError || selection.isPending}
                            onSelect={async (identifier) => {
                                await selection.mutateAsync({ identifier });
                            }}
                            onToggle={(category) => email.mutate({ category })}
                        />
                    )}
                </Flex.Col>
            </Section>
            <Section title={t("notificationSettings.region")} actions={retry} className={pageStyles.section}>
                <Flex.Col className={pageStyles.panel}>
                    {query.isError && error}
                    {query.isPending && loading}
                    {!query.isError && query.data && (
                        <NotificationRegion key={query.data.recipient.id} recipient={query.data.recipient} />
                    )}
                </Flex.Col>
            </Section>
        </ProfileLayout>
    );
}
