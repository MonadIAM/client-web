import { Button, Flex, RecoveryCodes, Warning } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";

import { useRecoveryCodes } from "../model/recovery-codes";
import { pageStyles } from "./styles";

export function SaveRecoveryCodes({ codes, onComplete }: Signup.SaveRecoveryCodes.Props) {
    const { t } = useTranslation();
    const { copy } = useRecoveryCodes({ codes, onComplete });

    return (
        <Fragment>
            <Warning title={t("auth.saveCodesTitle")}>{t("auth.saveCodes")}</Warning>
            <RecoveryCodes codes={codes} />
            <Flex.Col gap="0.75rem" className={pageStyles.recoveryActions}>
                <Button type="button" variant={ButtonVariant.OUTLINE} onClick={() => void copy()}>
                    {t("auth.copyCodes")}
                </Button>
                <Button
                    variant={ButtonVariant.OUTLINE}
                    nativeButton={false}
                    render={
                        <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(`${codes.join("\n")}\n`)}`}
                            download="monadiam-recovery-codes.txt"
                        />
                    }>
                    {t("auth.downloadCodes")}
                </Button>
                <Button type="button" onClick={onComplete}>
                    {t("auth.goToSignin")}
                </Button>
            </Flex.Col>
        </Fragment>
    );
}
