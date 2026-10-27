import { Button, Flex, RecoveryCodes, Warning } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { useProfileCopy } from "../../model/use-profile-copy";

export function SecondFactorRecovery({ code, onComplete }: SecondFactors.Recovery.Props) {
    const { t } = useTranslation();
    const { copied, copy } = useProfileCopy({ value: code });

    return (
        <Flex.Col gap="1rem">
            <Warning title={t("secondFactors.saveRecovery")}>{t("secondFactors.recoveryDescription")}</Warning>
            <RecoveryCodes codes={[code]} />
            <Button variant={ButtonVariant.OUTLINE} onClick={() => void copy()}>
                {copied ? t("common.copied") : t("secondFactors.copyRecovery")}
            </Button>
            <Button onClick={onComplete}>{t("secondFactors.savedRecovery")}</Button>
        </Flex.Col>
    );
}
