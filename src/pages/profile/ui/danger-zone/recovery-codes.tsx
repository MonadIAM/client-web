import { Button, Dialog, Flex, RecoveryCodes, Warning } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { useProfileCopy } from "../../model/use-profile-copy";

export function RecoveryCodesResult({ codes, onComplete }: AccountDangerZone.Codes.Props) {
    const { t } = useTranslation();
    const { copied, copy } = useProfileCopy({ value: codes.join("\n") });

    return (
        <div>
            <Flex.Col gap="1rem">
                <Warning title={t("dangerZone.codesOnce")}>{t("dangerZone.saveCodesDescription")}</Warning>
                <RecoveryCodes codes={codes} />
                <Button variant={ButtonVariant.OUTLINE} onClick={() => void copy()}>
                    {copied ? t("common.copied") : t("auth.copyCodes")}
                </Button>
                <Button
                    variant={ButtonVariant.OUTLINE}
                    nativeButton={false}
                    render={
                        <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(codes.join("\n"))}`}
                            download="monadiam-recovery-codes.txt"
                        />
                    }>
                    {t("auth.downloadCodes")}
                </Button>
            </Flex.Col>
            <Dialog.Actions>
                <Button onClick={onComplete}>{t("dangerZone.codesSaved")}</Button>
            </Dialog.Actions>
        </div>
    );
}
