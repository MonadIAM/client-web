import { useRef, useState } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Flex, Text } from "@monadiam/ui-kit";
import { TextTone } from "@monadiam/ui-kit/enums";

import { AppearanceDialog } from "~features/appearance";

import { profileLayoutStyles } from "./styles";

export function ProfileLayout({ title, description, children }: ProfileLayout.Props) {
    const { t } = useTranslation();
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);

    return (
        <Flex.Col gap="1.5rem" className={profileLayoutStyles.root}>
            <title>{title}</title>
            <Flex.Col render={<header />} gap="0.25rem">
                <Text.H1>{title}</Text.H1>
                <Text.P tone={TextTone.MUTED}>{description}</Text.P>
            </Flex.Col>
            <Flex.Row
                render={<nav />}
                gap="1.25rem"
                aria-label={t("settings.navigation")}
                className={profileLayoutStyles.navigation}>
                <NavLink to="/profile" end className={profileLayoutStyles.link}>
                    {t("profile.title")}
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
