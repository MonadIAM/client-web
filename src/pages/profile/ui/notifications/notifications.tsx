import { ButtonVariant, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";

import { ChannelType } from "~shared/api/generated/notification";

import { useNotificationSettings } from "../../model/notifications/use-notification-settings";
import { NotificationRegion } from "./notification-region";
import { NotificationSound } from "./notification-sound";
import { NotificationEmail } from "./notification-email";
import { ProfileLayout } from "../profile-layout";

export function Notifications() {
    const { t } = useTranslation();
    const { query, sound, email, disabled } = useNotificationSettings();

    return (
        <ProfileLayout title={t("notificationSettings.title")}>
            {query.isPending && (
                <Text.P role="status" aria-busy="true" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
            {query.isError && (
                <Flex.Col gap="0.75rem">
                    <Text.P role="alert" tone={TextTone.DANGER}>
                        {t("notificationSettings.loadError")}
                    </Text.P>
                    <Button variant={ButtonVariant.OUTLINE} loading={query.isFetching} onClick={() => void query.refetch()}>
                        {t("common.retry")}
                    </Button>
                </Flex.Col>
            )}
            {query.data && (
                <Fragment>
                    <NotificationSound
                        channel={query.data.channels.find((channel) => channel.type === ChannelType.IN_APP)}
                        disabled={disabled}
                        onToggle={() => sound.mutate()}
                    />
                    <NotificationEmail
                        preferences={query.data.preferences}
                        hasEmail={query.data.channels.some((channel) => channel.type === ChannelType.EMAIL)}
                        disabled={disabled}
                        onToggle={(category) => email.mutate({ category })}
                    />
                    <NotificationRegion key={query.data.recipient.id} recipient={query.data.recipient} />
                </Fragment>
            )}
        </ProfileLayout>
    );
}
