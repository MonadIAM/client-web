import { useTranslation } from "react-i18next";

import { secondFactorMutationKey } from "../../model/second-factors/use-second-factors.query";
import { useSecondFactorRefresh } from "../../model/second-factors/use-second-factor-refresh";
import { SecondFactorManager } from "../../model/second-factors/second-factor.manager";
import { SecurityRemoveForm } from "../security/security-remove-form";

export function SecondFactorRemoveForm({ factor, onRemoved }: SecondFactors.Remove.Props) {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();

    return (
        <SecurityRemoveForm
            title={t("secondFactors.remove")}
            subject={factor.name ?? t("secondFactors.unnamed")}
            description={t("secondFactors.removeDescription")}
            successMessage={t("secondFactors.removed")}
            mutationKey={secondFactorMutationKey}
            remove={() => SecondFactorManager.remove({ factor: factor.id })}
            onRemoved={() => {
                void refresh();
                onRemoved();
            }}
        />
    );
}
