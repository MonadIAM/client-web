import { useQuery } from "@tanstack/react-query";

import { SessionStatus } from "~src/enums";

import { PermissionManager } from "./permission.manager";
import { PermissionStore } from "./permission.store";
import { useSession } from "../session/use-session";

export function usePermission(options: Auth.Permission.UsePermission.Props = {}): Auth.Permission.UsePermission.Result {
    const session = useSession();
    const query = useQuery(PermissionStore.query({ session }));

    if (session.status === SessionStatus.AUTHENTICATED && query.isSuccess) {
        return {
            ...query,
            allowed: PermissionManager.matches({ permissions: query.data.data, options }),
        };
    } else {
        return { ...query, allowed: undefined };
    }
}
