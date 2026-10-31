import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~shared/notifications";

import { identifierMutationKey } from "./use-identifiers.query";
import { useIdentifierRefresh } from "./use-identifier-refresh";
import { IdentifierManager } from "./identifier.manager";

export function useIdentifierRemove() {
    const { t } = useTranslation();
    const refresh = useIdentifierRefresh();

    return useMutation({
        mutationKey: identifierMutationKey,
        mutationFn: IdentifierManager.remove,
        retry: false,

        onSuccess: async () => {
            NotificationManager.success({ title: t("identifiers.removed") });
            await refresh();
        },
        onError: (cause) => NotificationManager.error({ cause }),
    });
}
