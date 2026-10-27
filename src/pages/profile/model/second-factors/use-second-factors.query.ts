import { useQuery } from "@tanstack/react-query";

import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { SecondFactorManager } from "./second-factor.manager";

export const secondFactorMutationKey = ["second-factor-write"];
export const secondFactorsQueryKey = ["second-factors"];

export function useSecondFactorsQuery() {
    const session = useSession();

    return useQuery({
        queryKey: [...secondFactorsQueryKey, session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: ({ signal }) => SecondFactorManager.list({ signal }),
    });
}
