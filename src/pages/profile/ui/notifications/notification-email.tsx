import { Badge, Flex, List, Section, Switch, Text } from "@monadiam/ui-kit";
import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";

import { ChannelType, NotificationCategory } from "~shared/api/generated/notification";

import { notificationStyles } from "./styles";

const categories = [NotificationCategory.INVITES, NotificationCategory.SYSTEM, NotificationCategory.OTHER] as const;

export function NotificationEmail({ preferences, hasEmail, disabled, onToggle }: NotificationSettingsView.Email.Props) {
    const { t } = useTranslation();

    return (
        <Section title={t("notificationSettings.email")}>
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
                            <Fragment>
                                <Text.Span>{t(`notificationSettings.categories.${category}.label`)}</Text.Span>
                                <Text.P tone={TextTone.MUTED} size={TextSize.SM}>
                                    {t(`notificationSettings.categories.${category}.description`)}
                                </Text.P>
                            </Fragment>
                        ),
                        action: (
                            <Flex.Row className={notificationStyles.action}>
                                <Switch
                                    label={t(`notificationSettings.categories.${category}.label`)}
                                    showLabel={false}
                                    checked={
                                        preferences.find(
                                            (item) => item.channelType === ChannelType.EMAIL && item.category === category,
                                        )?.isDuplicationEnabled ?? true
                                    }
                                    disabled={disabled}
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
                            <Fragment>
                                <Text.Span>{t("notificationSettings.security")}</Text.Span>
                                <Text.P tone={TextTone.MUTED} size={TextSize.SM}>
                                    {t("notificationSettings.securityDescription")}
                                </Text.P>
                            </Fragment>
                        ),
                        action: (
                            <Badge className={notificationStyles.action}>{t("notificationSettings.alwaysEnabled")}</Badge>
                        ),
                    },
                ]}
            />
        </Section>
    );
}
