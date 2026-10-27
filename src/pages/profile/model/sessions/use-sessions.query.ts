import { useQuery } from "@tanstack/react-query";

import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { SessionsManager } from "./sessions.manager";

export const sessionsQueryKey = ["sessions"];

export function useSessionsQuery() {
    const session = useSession();
    const currentId = session.claims?.sid ?? "";

    return useQuery({
        queryKey: [...sessionsQueryKey, session.revision, currentId],
        enabled: session.status === SessionStatus.AUTHENTICATED && Boolean(currentId),
        queryFn: ({ signal }) => SessionsManager.list({ signal, currentId }),
    });
}
