import { useTranslation } from "react-i18next";

import { secondFactorMutationKey } from "../../model/second-factors/use-second-factors.query";
import { useSecondFactorRefresh } from "../../model/second-factors/use-second-factor-refresh";
import { SecondFactorManager } from "../../model/second-factors/second-factor.manager";
import { SecurityActionForm } from "../security/security-action-form";
import { SecurityAuthentication } from "../../model/security/enums";

export function SecondFactorRemoveForm({ factor, onRemoved }: SecondFactors.Remove.Props) {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();

    return (
        <SecurityActionForm
            actionLabel={t("common.delete")}
            title={t("secondFactors.remove")}
            subject={factor.name ?? t("secondFactors.unnamed")}
            description={t("secondFactors.removeDescription")}
            successMessage={t("secondFactors.removed")}
            mutationKey={secondFactorMutationKey}
            method={SecurityAuthentication.SECOND_FACTOR}
            action={() => SecondFactorManager.remove({ factor: factor.id, confirmed: Boolean(factor.confirmedAt) })}
            onComplete={() => {
                void refresh();
                onRemoved();
            }}
        />
    );
}
