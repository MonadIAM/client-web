import { FlexAlignment, FlexJustification, SpinnerVariant } from "@monadiam/ui-kit/enums";
import { Text, Flex, Spinner } from "@monadiam/ui-kit";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

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
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <title>{t(failed ? "social.failed" : "social.completing")}</title>
                    <Text.H1>{t(failed ? "social.failed" : "social.completing")}</Text.H1>
                </header>
                {failed ? (
                    <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                        <Link to="/signin">{t("auth.continue")}</Link>
                    </Flex.Col>
                ) : (
                    <Flex.Col
                        align={FlexAlignment.CENTER}
                        justify={FlexJustification.CENTER}
                        gap="0.75rem"
                        className={pageStyles.authPreparation}
                        role="status"
                        aria-label={t("social.completing")}>
                        <Spinner variant={SpinnerVariant.INLINE} aria-hidden="true" />
                    </Flex.Col>
                )}
            </Flex.Col>
        </Flex.Col>
    );
}
