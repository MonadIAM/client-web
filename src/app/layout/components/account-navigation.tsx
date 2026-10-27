import { UserIcon, BrushIcon, LogoutIcon, ShieldLockIcon } from "@monadiam/ui-kit/icons";
import { FlexAlignment, TextSize, TextTone, TextWeight } from "@monadiam/ui-kit/enums";
import { Avatar, DropdownMenu, Flex, Text } from "@monadiam/ui-kit";
import { Fragment, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { AppearanceDialog } from "~features/appearance";
import { useAccount, useProfile } from "~shared/auth";
import { useLogout } from "~features/authentication";

import { layoutStyles } from "../styles";

export function AccountNavigation() {
    const { t } = useTranslation();
    const profile = useProfile();
    const account = useAccount();
    const { pending, logout } = useLogout();
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null);
    const name = account.data?.profile?.displayName ?? profile.data?.name;

    return (
        <Fragment>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenu.Trigger ref={trigger} className={layoutStyles.profile} aria-label={t("nav.account")}>
                    <Avatar name={name} label={name ? t("nav.profile", { name }) : t("nav.account")} />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content finalFocus={appearanceOpen ? false : trigger}>
                    <Flex.Row align={FlexAlignment.CENTER} gap="0.5rem" className={layoutStyles.accountSummary}>
                        <Avatar name={name} label={name ?? t("nav.account")} className={layoutStyles.accountAvatar} />
                        <Flex.Col className={layoutStyles.accountName}>
                            <Text.Span
                                size={TextSize.SM}
                                weight={TextWeight.SEMIBOLD}
                                className={layoutStyles.accountDisplayName}>
                                {name ?? t("nav.account")}
                            </Text.Span>
                            <Text.Span size={TextSize.XS} tone={TextTone.MUTED}>
                                {t("settings.personalAccount")}
                            </Text.Span>
                        </Flex.Col>
                    </Flex.Row>
                    <DropdownMenu.Separator />
                    <DropdownMenu.LinkItem render={<Link to="/profile" />}>
                        <UserIcon aria-hidden="true" />
                        {t("profile.title")}
                    </DropdownMenu.LinkItem>
                    <DropdownMenu.LinkItem render={<Link to="/profile/security" />}>
                        <ShieldLockIcon aria-hidden="true" />
                        {t("security.title")}
                    </DropdownMenu.LinkItem>
                    <DropdownMenu.Item
                        onClick={() => {
                            setMenuOpen(false);
                            setAppearanceOpen(true);
                        }}
                        aria-haspopup="dialog">
                        <BrushIcon aria-hidden="true" />
                        {t("nav.appearance")}
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item destructive disabled={pending} onClick={() => void logout()}>
                        <LogoutIcon aria-hidden="true" />
                        {t("auth.signout")}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu>
            <AppearanceDialog open={appearanceOpen} onOpenChange={setAppearanceOpen} returnFocus={trigger} />
        </Fragment>
    );
}
