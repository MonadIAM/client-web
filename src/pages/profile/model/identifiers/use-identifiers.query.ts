import { useQuery } from "@tanstack/react-query";

import { useSession } from "~shared/auth";
import { SessionStatus } from "~shared/auth/session";

import { IdentifierManager } from "./identifier.manager";

export const identifierMutationKey = ["identifier-write"];
export const identifiersQueryKey = ["identifiers"];

export function useIdentifiersQuery() {
    const session = useSession();

    return useQuery({
        queryKey: [...identifiersQueryKey, session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: ({ signal }) => IdentifierManager.list({ signal }),
    });
}
