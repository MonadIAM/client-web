import { ButtonSize, ButtonVariant, TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Flex, List, Section, Switch, Text } from "@monadiam/ui-kit";
import { VolumeIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";

import { useNotificationSound } from "~shared/notifications/sound";

import { notificationStyles } from "./styles";

export function NotificationSound({ channel, disabled, onToggle }: NotificationSettingsView.Sound.Props) {
    const { t } = useTranslation();
    const { play, playing } = useNotificationSound();

    return (
        <Section title={t("notificationSettings.inApp")}>
            <List
                items={[
                    {
                        id: "sound",
                        label: t("notificationSettings.sound"),
                        showLabel: false,
                        content: (
                            <Flex.Row className="items-center" gap="0.75rem">
                                <Button
                                    variant={ButtonVariant.GHOST}
                                    size={ButtonSize.ICON}
                                    aria-label={t("notificationSettings.previewSound")}
                                    title={t("notificationSettings.previewSound")}
                                    disabled={playing}
                                    onClick={() => void play()}>
                                    <VolumeIcon aria-hidden="true" />
                                </Button>
                                <Flex.Col>
                                    <Text.Span>{t("notificationSettings.sound")}</Text.Span>
                                    <Text.P size={TextSize.SM} tone={TextTone.MUTED}>
                                        {t(
                                            channel
                                                ? "notificationSettings.soundDescription"
                                                : "notificationSettings.noInApp",
                                        )}
                                    </Text.P>
                                </Flex.Col>
                            </Flex.Row>
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
