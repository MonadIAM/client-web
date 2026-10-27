import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog } from "@monadiam/ui-kit";

import { identifierMutationKey } from "../../model/identifiers/use-identifiers.query";
import { IdentifierDialogMode } from "../../model/identifiers/enums";
import { IdentifierCreateForm } from "./identifier-create-form";
import { IdentifierVerifyForm } from "./identifier-verify-form";
import { IdentifierRemoveForm } from "./identifier-remove-form";
import { securityStyles } from "../security/styles";

export function IdentifierDialog({ state, onClose, onChange }: Identifiers.Dialog.Props) {
    const { t } = useTranslation();
    const pending = useIsMutating({ mutationKey: identifierMutationKey }) > 0;

    const step = state.mode === IdentifierDialogMode.ADD ? 1 : 2;
    const description = state.mode === IdentifierDialogMode.REMOVE ? undefined : t("identifiers.step", { step });

    const titles = {
        [IdentifierDialogMode.ADD]: t("identifiers.add"),
        [IdentifierDialogMode.VERIFY]: t("identifiers.verifyTitle"),
        [IdentifierDialogMode.REMOVE]: t("identifiers.remove"),
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !pending) {
                    onClose();
                }
            }}>
            <Dialog.Content
                className={securityStyles.dialog}
                title={titles[state.mode]}
                description={description}
                closeLabel={t("common.close")}>
                {state.mode === IdentifierDialogMode.ADD && (
                    <IdentifierCreateForm
                        onCreated={(identity) =>
                            onChange({
                                mode: IdentifierDialogMode.VERIFY,
                                identity,
                            })
                        }
                    />
                )}
                {state.mode === IdentifierDialogMode.VERIFY && (
                    <IdentifierVerifyForm identity={state.identity} onVerified={onClose} />
                )}
                {state.mode === IdentifierDialogMode.REMOVE && (
                    <IdentifierRemoveForm id={state.id} identity={state.identity} onRemoved={onClose} />
                )}
            </Dialog.Content>
        </Dialog>
    );
}
