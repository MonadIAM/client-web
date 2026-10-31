import { Badge, Flex, List, Switch, Text } from "@monadiam/ui-kit";
import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { ChannelType, NotificationCategory } from "~shared/api/generated/notification";
import { NotificationCategoryIcon } from "~features/notification-preview";

import { NotificationEmailAddress } from "./notification-email-address";
import { notificationStyles } from "./styles";

const categories = [NotificationCategory.INVITES, NotificationCategory.SYSTEM, NotificationCategory.OTHER] as const;

export function NotificationEmail({
    preferences,
    channel,
    emails,
    hasEmail,
    disabled,
    onSelect,
    onToggle,
}: NotificationSettingsView.Email.Props) {
    const { t } = useTranslation();

    return (
        <Flex.Col gap="1rem">
            <NotificationEmailAddress
                key={channel?.sourceIdentifier ?? "unassigned"}
                channel={channel}
                emails={emails}
                disabled={disabled}
                onSelect={onSelect}
            />
            {!hasEmail && (
                <Text.P tone={TextTone.MUTED} size={TextSize.SM}>
                    {t("notificationSettings.noEmail")}
                </Text.P>
            )}
            <List
                items={[
                    ...categories.map((category) => ({
                        id: category,
                        label: t(`notificationSettings.categories.${category}.label`),
                        showLabel: false,
                        content: (
                            <Flex.Row className="items-center" gap="0.75rem">
                                <NotificationCategoryIcon category={category} />
                                <Flex.Col>
                                    <Text.Span>{t(`notificationSettings.categories.${category}.label`)}</Text.Span>
                                    <Text.P tone={TextTone.MUTED} size={TextSize.SM}>
                                        {t(`notificationSettings.categories.${category}.description`)}
                                    </Text.P>
                                </Flex.Col>
                            </Flex.Row>
                        ),
                        action: (
                            <Flex.Row className={notificationStyles.action}>
                                <Switch
                                    label={t(`notificationSettings.categories.${category}.label`)}
                                    showLabel={false}
                                    checked={
                                        hasEmail &&
                                        (preferences.find(
                                            (item) => item.channelType === ChannelType.EMAIL && item.category === category,
                                        )?.isDuplicationEnabled ??
                                            false)
                                    }
                                    disabled={disabled || !hasEmail}
                                    onCheckedChange={() => onToggle(category)}
                                />
                            </Flex.Row>
                        ),
                    })),
                    {
                        id: NotificationCategory.SECURITY,
                        label: t("notificationSettings.security"),
                        showLabel: false,
                        content: (
                            <Flex.Row className="items-center" gap="0.75rem">
                                <NotificationCategoryIcon category={NotificationCategory.SECURITY} />
                                <Flex.Col>
                                    <Text.Span>{t("notificationSettings.security")}</Text.Span>
                                    <Text.P tone={TextTone.MUTED} size={TextSize.SM}>
                                        {t("notificationSettings.securityDescription")}
                                    </Text.P>
                                </Flex.Col>
                            </Flex.Row>
                        ),
                        action: (
                            <Badge className={notificationStyles.action}>
                                {t(hasEmail ? "notificationSettings.alwaysEnabled" : "notificationSettings.unavailable")}
                            </Badge>
                        ),
                    },
                ]}
            />
        </Flex.Col>
    );
}
