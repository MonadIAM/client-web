import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog } from "@monadiam/ui-kit";
import { useState } from "react";

import { DangerZoneManager } from "../../model/danger-zone/danger-zone.manager";
import { dangerZoneMutationKey } from "../../model/danger-zone/constants";
import { SecurityActionForm } from "../security/security-action-form";
import { DangerZoneAction } from "../../model/danger-zone/enums";
import { RecoveryCodesResult } from "./recovery-codes";
import { securityStyles } from "../security/styles";
import { PasswordForm } from "./password-form";

export function SecurityDangerDialog({ action, hasPassword, onClose }: AccountDangerZone.Dialog.Props) {
    const { t } = useTranslation();
    const pending = useIsMutating({ mutationKey: dangerZoneMutationKey }) > 0;
    const [confirmed, setConfirmed] = useState(false);
    const [codes, setCodes] = useState<string[]>();
    const isPassword = action === DangerZoneAction.PASSWORD;
    let title = t("dangerZone.regenerateCodes");
    if (isPassword) {
        title = hasPassword ? t("dangerZone.changePassword") : t("dangerZone.setPassword");
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !pending && !codes) {
                    onClose();
                }
            }}>
            <Dialog.Content
                title={title}
                closeLabel={t("common.close")}
                showClose={!codes && !pending}
                className={securityStyles.dialog}>
                {codes && <RecoveryCodesResult codes={codes} onComplete={onClose} />}
                {!codes && isPassword && (hasPassword || confirmed) && (
                    <PasswordForm hasPassword={hasPassword} onComplete={onClose} />
                )}
                {!codes && isPassword && !hasPassword && !confirmed && (
                    <SecurityActionForm
                        authenticateOnly
                        title={title}
                        subject={title}
                        description={t("dangerZone.setPasswordDescription")}
                        mutationKey={dangerZoneMutationKey}
                        onComplete={() => setConfirmed(true)}
                    />
                )}
                {!codes && !isPassword && (
                    <SecurityActionForm
                        title={title}
                        subject={t("dangerZone.recoveryCodes")}
                        description={t("dangerZone.regenerateWarning")}
                        mutationKey={dangerZoneMutationKey}
                        action={async () => {
                            setCodes(await DangerZoneManager.regenerateCodes());
                        }}
                        onComplete={() => setConfirmed(true)}
                    />
                )}
            </Dialog.Content>
        </Dialog>
    );
}
