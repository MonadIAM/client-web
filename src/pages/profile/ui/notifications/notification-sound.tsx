import { Flex, List, Section, Switch, Text } from "@monadiam/ui-kit";
import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";

import { notificationStyles } from "./styles";

export function NotificationSound({ channel, disabled, onToggle }: NotificationSettingsView.Sound.Props) {
    const { t } = useTranslation();

    return (
        <Section title={t("notificationSettings.inApp")}>
            <List
                items={[
                    {
                        id: "sound",
                        label: t("notificationSettings.sound"),
                        showLabel: false,
                        content: (
                            <Fragment>
                                <Text.Span>{t("notificationSettings.sound")}</Text.Span>
                                <Text.P size={TextSize.SM} tone={TextTone.MUTED}>
                                    {t(channel ? "notificationSettings.soundDescription" : "notificationSettings.noInApp")}
                                </Text.P>
                            </Fragment>
                        ),
                        action: (
                            <Flex.Row className={notificationStyles.action}>
                                <Switch
                                    label={t("notificationSettings.sound")}
                                    showLabel={false}
                                    checked={channel?.soundEnabled ?? false}
                                    disabled={disabled || !channel}
                                    onCheckedChange={onToggle}
                                />
                            </Flex.Row>
                        ),
                    },
                ]}
            />
        </Section>
    );
}
