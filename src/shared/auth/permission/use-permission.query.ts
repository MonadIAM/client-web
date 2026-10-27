import { useQuery } from "@tanstack/react-query";

import { PermissionManager } from "./permission.manager";
import { permissionQuery } from "./permission.queries";
import { useSession } from "../session/use-session";
import { SessionStatus } from "../session/enums";

export function usePermission(options: Auth.Permission.UsePermission.Props = {}): Auth.Permission.UsePermission.Result {
    const session = useSession();
    const query = useQuery(permissionQuery({ session }));

    if (session.status === SessionStatus.AUTHENTICATED && query.isSuccess) {
        return {
            ...query,
            allowed: PermissionManager.matches({ permissions: query.data.data, options }),
        };
    } else {
        return query;
    }
}
