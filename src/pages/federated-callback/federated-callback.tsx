import { SpinnerVariant } from "@monadiam/ui-kit/enums";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Spinner } from "@monadiam/ui-kit";

import { NotificationManager } from "~common/notifications";
import { FederatedManager } from "~auth";

import { pageStyles } from "./styles";

export function FederatedCallback() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [address] = useState(() => location.href);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        void FederatedManager.complete({ address }).then(
            (result) => {
                if (active) {
                    location.replace(result.authorizationUrl);
                }
            },
            (cause: unknown) => {
                if (active) {
                    NotificationManager.error({ cause });
                    setFailed(true);
                    navigate("/auth/federated/callback", { replace: true });
                }
            },
        );

        return () => {
            active = false;
        };
    }, [address, navigate]);

    return (
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{t(failed ? "social.failed" : "social.completing")}</h1>
                </header>
                {failed ? (
                    <footer className={pageStyles.footer}>
                        <Link to="/signin">{t("auth.continue")}</Link>
                    </footer>
                ) : (
                    <div className={pageStyles.authPreparation} role="status" aria-label={t("social.completing")}>
                        <Spinner variant={SpinnerVariant.INLINE} aria-hidden="true" />
                    </div>
                )}
            </div>
        </section>
    );
}
