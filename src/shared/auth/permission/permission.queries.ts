import { queryOptions } from "@tanstack/react-query";

import { PermissionManager } from "./permission.manager";
import { SessionStatus } from "../session/enums";

export const permissionQueryKey = ["permissions"];

export function permissionQuery({ session }: Auth.Permission.Query.Props): Auth.Permission.Query.Result {
    return queryOptions({
        queryKey: [...permissionQueryKey, session.revision, session.claims?.realms],
        staleTime: Number(process.env.AUTH_PERMISSION_STALE_TIME_MS),
        queryFn: ({ signal }) => PermissionManager.list({ signal }),
        enabled: session.status === SessionStatus.AUTHENTICATED,
    });
}
