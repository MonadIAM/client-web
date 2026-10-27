import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "~shared/auth";

import { secondFactorsQueryKey } from "./use-second-factors.query";

export function useSecondFactorRefresh() {
    const client = useQueryClient();
    const session = useSession();

    return () => client.invalidateQueries({ queryKey: [...secondFactorsQueryKey, session.revision] });
}
