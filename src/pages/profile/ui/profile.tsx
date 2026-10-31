import { TextTone } from "@monadiam/ui-kit/enums";
import { Flex, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { QueryError } from "~shared/ui/query-error";
import { RetryButton } from "~shared/ui/retry-button";
import { useAccount } from "~shared/auth";

import { ProfileDangerZone } from "./danger-zone/profile-danger-zone";
import { ProfileDetails } from "./profile-details";
import { ProfileAccount } from "./profile-account";
import { ProfileLayout } from "./profile-layout";
import { pageStyles } from "./styles";

export function Profile() {
    const { t } = useTranslation();
    const account = useAccount();
    const retry = account.isError && <RetryButton loading={account.isFetching} onClick={() => void account.refetch()} />;
    const error = account.isError && <QueryError cause={account.error} fallback={t("profile.loadError")} />;
    const loading = !account.data && !account.isError && (
        <Text.P role="status" aria-busy="true" tone={TextTone.MUTED}>
            {t("common.loading")}
        </Text.P>
    );

    return (
        <ProfileLayout title={t("profile.title")}>
            <Section title={t("profile.details")} actions={retry} className={pageStyles.section}>
                <Flex.Col className={pageStyles.panel}>
                    {error}
                    {loading}
                    {!account.isError && account.data && <ProfileDetails key={account.data.id} account={account.data} />}
                </Flex.Col>
            </Section>
            <Section title={t("profile.account")} actions={retry} className={pageStyles.section}>
                <Flex.Col className={pageStyles.panel}>
                    {error}
                    {loading}
                    {!account.isError && account.data && <ProfileAccount account={account.data} />}
                </Flex.Col>
            </Section>
            <ProfileDangerZone disabled={!account.data || account.isError} />
        </ProfileLayout>
    );
}
