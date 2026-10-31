import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~shared/notifications";

import { secondFactorMutationKey } from "./use-second-factors.query";
import { useSecondFactorRefresh } from "./use-second-factor-refresh";
import { SecondFactorManager } from "./second-factor.manager";

export function useSecondFactorRemove() {
    const { t } = useTranslation();
    const refresh = useSecondFactorRefresh();

    return useMutation({
        mutationKey: secondFactorMutationKey,
        mutationFn: SecondFactorManager.remove,
        retry: false,

        onSuccess: async () => {
            NotificationManager.success({ title: t("secondFactors.removed") });
            await refresh();
        },
        onError: (cause) => NotificationManager.error({ cause }),
    });
}
