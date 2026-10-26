import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import light from "~assets/images/mark-light.svg";
import dark from "~assets/images/mark-dark.svg";
import { SessionStatus } from "~src/enums";
import { useSession } from "~auth";

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
            <span>MonadIAM</span>
        </Link>
    );
}
