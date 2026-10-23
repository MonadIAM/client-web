import { useQuery } from "@tanstack/react-query";

import { PermissionManager, PermissionStore } from "../permission";
import { useSession } from "./use-session";

export function usePermission(options: Auth.Hooks.UsePermission.Props = {}): Auth.Hooks.UsePermission.Result {
    const session = useSession();
    const query = useQuery(PermissionStore.query({ session }));

    if (session.status === "authenticated" && query.isSuccess) {
        return {
            ...query,
            allowed: PermissionManager.matches({ permissions: query.data.data, options }),
        };
    } else {
        return { ...query, allowed: undefined };
    }
}
