import { useTranslation } from "react-i18next";

import { identifierMutationKey } from "../../model/identifiers/use-identifiers.query";
import { useIdentifierRefresh } from "../../model/identifiers/use-identifier-refresh";
import { IdentifierManager } from "../../model/identifiers/identifier.manager";
import { SecurityRemoveForm } from "../security/security-remove-form";

export function IdentifierRemoveForm({ id, identity, onRemoved }: Identifiers.Remove.Props) {
    const { t } = useTranslation();
    const refresh = useIdentifierRefresh();

    return (
        <SecurityRemoveForm
            title={t("identifiers.remove")}
            subject={identity}
            description={t("identifiers.removeDescription")}
            successMessage={t("identifiers.removed")}
            mutationKey={identifierMutationKey}
            remove={() => IdentifierManager.remove({ identifier: id })}
            onRemoved={() => {
                void refresh();

                onRemoved();
            }}
        />
    );
}
