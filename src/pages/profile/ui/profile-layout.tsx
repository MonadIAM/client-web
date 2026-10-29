import { Button, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { NavLink } from "react-router";

import { useNotificationTitle } from "~features/notification-preview";
import { AppearanceDialog } from "~features/appearance";

import { profileLayoutStyles } from "./styles";

export function ProfileLayout({ title, children }: ProfileLayout.Props) {
    const { t } = useTranslation();
    const pageTitle = useNotificationTitle(title);
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);

    return (
        <Flex.Col gap="1.5rem" className={profileLayoutStyles.root}>
            <title>{pageTitle}</title>
            <Flex.Col render={<header />}>
                <Text.H1>{title}</Text.H1>
            </Flex.Col>
            <Flex.Row
                render={<nav />}
                gap="1.25rem"
                aria-label={t("settings.navigation")}
                className={profileLayoutStyles.navigation}>
                <NavLink to="/profile" end className={profileLayoutStyles.link}>
                    {t("profile.title")}
                </NavLink>
                <NavLink to="/profile/notifications" className={profileLayoutStyles.link}>
                    {t("notificationSettings.tab")}
                </NavLink>
                <NavLink to="/profile/security" className={profileLayoutStyles.link}>
                    {t("security.title")}
                </NavLink>
                <NavLink to="/profile/sessions" className={profileLayoutStyles.link}>
                    {t("sessions.title")}
                </NavLink>
                <Button.Link
                    ref={trigger}
                    onClick={() => setAppearanceOpen(true)}
                    className={profileLayoutStyles.link}
                    aria-haspopup="dialog">
                    {t("appearance.title")}
                </Button.Link>
            </Flex.Row>
            {children}
            <AppearanceDialog open={appearanceOpen} onOpenChange={setAppearanceOpen} returnFocus={trigger} />
        </Flex.Col>
    );
}
