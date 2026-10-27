import { ButtonVariant, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Section, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useAccount } from "~shared/auth";

import { ProfileDetails } from "./profile-details";
import { ProfileLayout } from "./profile-layout";

export function Profile() {
    const { t } = useTranslation();
    const account = useAccount();

    return (
        <ProfileLayout title={t("profile.title")}>
            {account.data && <ProfileDetails key={account.data.id} account={account.data} />}
            {!account.data && account.isError && (
                <Section title={t("profile.loadError")}>
                    <Text.P role="alert" tone={TextTone.MUTED}>
                        {t("profile.loadErrorDescription")}
                    </Text.P>
                    <Button
                        variant={ButtonVariant.OUTLINE}
                        loading={account.isFetching}
                        onClick={() => void account.refetch()}>
                        {t("common.retry")}
                    </Button>
                </Section>
            )}
            {!account.data && !account.isError && (
                <Text.P role="status" aria-busy="true" tone={TextTone.MUTED}>
                    {t("common.loading")}
                </Text.P>
            )}
        </ProfileLayout>
    );
}
