import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "~shared/auth";

import { secondFactorsQueryKey } from "./use-second-factors.query";
import { securityQueryKey } from "../security/use-security.query";

export function useSecondFactorRefresh() {
    const client = useQueryClient();
    const session = useSession();

    return async () => {
        await Promise.all([
            client.invalidateQueries({ queryKey: [...secondFactorsQueryKey, session.revision] }),
            client.invalidateQueries({ queryKey: securityQueryKey }),
        ]);
    };
}
