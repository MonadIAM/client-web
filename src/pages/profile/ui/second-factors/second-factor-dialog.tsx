import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog } from "@monadiam/ui-kit";
import { useState } from "react";

import { secondFactorMutationKey } from "../../model/second-factors/use-second-factors.query";
import { SecondFactorDialogMode } from "../../model/second-factors/enums";
import { SecondFactorCreateForm } from "./second-factor-create-form";
import { SecondFactorRemoveForm } from "./second-factor-remove-form";
import { SecondFactorRecovery } from "./second-factor-recovery";
import { SecondFactorSetup } from "./second-factor-setup";
import { securityStyles } from "../security/styles";

export function SecondFactorDialog({ state, onChange, onClose }: SecondFactors.Dialog.Props) {
    const { t } = useTranslation();
    const pending = useIsMutating({ mutationKey: secondFactorMutationKey }) > 0;

    const [recoveryCode, setRecoveryCode] = useState<string>();

    const titles = {
        [SecondFactorDialogMode.ADD]: t("secondFactors.add"),
        [SecondFactorDialogMode.VERIFY]: t("secondFactors.verifyTitle"),
        [SecondFactorDialogMode.REMOVE]: t("secondFactors.remove"),
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !pending && !recoveryCode) {
                    onClose();
                }
            }}>
            <Dialog.Content
                title={recoveryCode ? t("secondFactors.recoveryTitle") : titles[state.mode]}
                closeLabel={t("common.close")}
                showClose={!recoveryCode}
                className={securityStyles.dialog}>
                {recoveryCode && <SecondFactorRecovery code={recoveryCode} onComplete={onClose} />}
                {!recoveryCode && state.mode === SecondFactorDialogMode.ADD && (
                    <SecondFactorCreateForm
                        onCreated={(setup) => onChange({ mode: SecondFactorDialogMode.VERIFY, setup })}
                    />
                )}
                {!recoveryCode && state.mode === SecondFactorDialogMode.VERIFY && (
                    <SecondFactorSetup
                        factor={state.factor}
                        setup={state.setup}
                        onVerified={(result) => {
                            if (result.code) {
                                setRecoveryCode(result.code);
                            } else {
                                onClose();
                            }
                        }}
                    />
                )}
                {!recoveryCode && state.mode === SecondFactorDialogMode.REMOVE && state.factor && (
                    <SecondFactorRemoveForm factor={state.factor} onRemoved={onClose} />
                )}
            </Dialog.Content>
        </Dialog>
    );
}
