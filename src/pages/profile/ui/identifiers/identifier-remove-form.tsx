import { useTranslation } from "react-i18next";

import { identifierMutationKey } from "../../model/identifiers/use-identifiers.query";
import { useIdentifierRefresh } from "../../model/identifiers/use-identifier-refresh";
import { IdentifierManager } from "../../model/identifiers/identifier.manager";
import { SecurityActionForm } from "../security/security-action-form";

export function IdentifierRemoveForm({ id, identity, isVerified, onRemoved }: Identifiers.Remove.Props) {
    const { t } = useTranslation();
    const refresh = useIdentifierRefresh();

    return (
        <SecurityActionForm
            title={t("identifiers.remove")}
            subject={identity}
            description={t("identifiers.removeDescription")}
            successMessage={t("identifiers.removed")}
            mutationKey={identifierMutationKey}
            action={() => IdentifierManager.remove({ identifier: id, isVerified })}
            onComplete={() => {
                void refresh();

                onRemoved();
            }}
        />
    );
}
