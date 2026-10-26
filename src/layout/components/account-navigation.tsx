import { useTranslation } from "react-i18next";
import { Avatar } from "@monadiam/ui-kit";
import { Link } from "react-router";

import { useProfile } from "~auth";

import { layoutStyles } from "../styles";

export function AccountNavigation() {
    const { t } = useTranslation();
    const profile = useProfile();

    const name = profile.data?.name;

    return (
        <Link to="/profile" className={layoutStyles.profile}>
            <Avatar name={name} label={name ? t("nav.profile", { name }) : t("nav.account")} />
        </Link>
    );
}
