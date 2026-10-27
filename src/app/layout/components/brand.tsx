import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { SessionStatus } from "~shared/auth/session";
import light from "~app/assets/mark-light.svg";
import dark from "~app/assets/mark-dark.svg";
import { useSession } from "~shared/auth";

import { layoutStyles } from "../styles";

export function Brand() {
    const { t } = useTranslation();
    const { status } = useSession();

    return (
        <Link
            to={status === SessionStatus.AUTHENTICATED ? "/" : "/signin"}
            aria-label={t("common.home")}
            className={layoutStyles.brand}>
            <img src={light} className={layoutStyles.markLight} alt="" width="36" height="36" />
            <img src={dark} className={layoutStyles.markDark} alt="" width="36" height="36" />
            MonadIAM
        </Link>
    );
}
