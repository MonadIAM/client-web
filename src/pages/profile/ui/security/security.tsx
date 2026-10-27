import { useTranslation } from "react-i18next";

import { SecondFactors } from "../second-factors/second-factors";
import { Identifiers } from "../identifiers/identifiers";
import { ProfileLayout } from "../profile-layout";

export function Security() {
    const { t } = useTranslation();

    return (
        <ProfileLayout title={t("security.title")}>
            <Identifiers />
            <SecondFactors />
        </ProfileLayout>
    );
}
