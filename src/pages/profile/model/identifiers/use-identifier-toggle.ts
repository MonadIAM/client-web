import { useMutation } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";

import { identifierMutationKey } from "./use-identifiers.query";
import { IdentifierManager } from "./identifier.manager";
import { useIdentifierRefresh } from "./use-identifier-refresh";

export function useIdentifierToggle() {
    const refresh = useIdentifierRefresh();

    return useMutation({
        mutationKey: identifierMutationKey,
        mutationFn: IdentifierManager.toggle,

        onSuccess: refresh,
        onError: (cause) => NotificationManager.error({ cause }),
    });
}
