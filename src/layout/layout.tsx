import { NavbarAppearance } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Navbar } from "@monadiam/ui-kit";

import { NotificationHost } from "~common/notifications/notification.host";
import { SessionStatus } from "~src/enums";
import { useSession } from "~auth";

import { AccountNavigation } from "./components/account-navigation";
import { LanguageSwitcher } from "./components/language-switcher";
import { ThemeSwitcher } from "./components/theme-switcher";
import { Brand } from "./components/brand";
import { layoutStyles } from "./styles";

export function Layout({ children }: Layout.Props) {
    const { t } = useTranslation();
    const session = useSession();

    return (
        <div className={layoutStyles.root}>
            <a href="#main-content" className={layoutStyles.skip}>
                {t("common.skip")}
            </a>
            <Navbar
                className={layoutStyles.header}
                appearance={
                    session.status === SessionStatus.AUTHENTICATED ? NavbarAppearance.SOLID : NavbarAppearance.PLAIN
                }
                brand={<Brand />}
                actions={
                    session.status === SessionStatus.AUTHENTICATED ? (
                        <AccountNavigation />
                    ) : (
                        <>
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                        </>
                    )
                }
            />
            <main id="main-content" tabIndex={-1} className={layoutStyles.content}>
                {children}
            </main>
            <NotificationHost />
        </div>
    );
}
