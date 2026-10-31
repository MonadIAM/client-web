import { useQuery } from "@tanstack/react-query";

import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { SecurityManager } from "./security.manager";

export const securityQueryKey = ["account-security"];

export function useSecurityQuery() {
    const session = useSession();

    return useQuery({
        queryKey: [...securityQueryKey, session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: ({ signal }) => SecurityManager.status({ signal }),
    });
}
