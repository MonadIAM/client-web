import { useQueryClient } from "@tanstack/react-query";

import { accountQueryKey, useSession } from "~shared/auth";

import { identifiersQueryKey } from "./use-identifiers.query";

export function useIdentifierRefresh() {
    const client = useQueryClient();
    const session = useSession();

    return async () => {
        await Promise.all([
            client.invalidateQueries({
                queryKey: [...identifiersQueryKey, session.revision],
            }),
            client.invalidateQueries({
                queryKey: [...accountQueryKey, session.revision],
            }),
            client.invalidateQueries({
                queryKey: ["profile", session.revision],
            }),
        ]);
    };
}
