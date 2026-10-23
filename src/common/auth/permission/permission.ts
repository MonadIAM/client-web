import { AccessControl } from "~api/sdk";

import { AuthClient } from "../client";

export abstract class Permission {
    private constructor() {}

    public static async list(signal: AbortSignal): Promise<API.AccessControl.Privileges> {
        const response = await AccessControl.permissionControllerGetPrivileges({ signal, throwOnError: true });
        return response.data;
    }

    public static matches(props: Auth.Permission.Match.Props): Auth.Permission.Match.Result {
        const codes = typeof props.options.codes === "string" ? [props.options.codes] : props.options.codes;
        if (codes && codes.length > 0) {
            const matches = (code: string): boolean => {
                const permissions = props.permissions[code] ?? [];
                return permissions.some((access) => this.checkAccess({ access, options: props.options }));
            };
            return props.options.match === "any" ? codes.some(matches) : codes.every(matches);
        } else {
            return false;
        }
    }

    public static invalidate(): Promise<void> {
        return AuthClient.invalidatePermissions();
    }

    private static checkAccess(props: Auth.Permission.CheckAccess.Props): Auth.Permission.CheckAccess.Result {
        const scopeMatches = props.options.scope === undefined || props.access.scope === props.options.scope;
        if (scopeMatches) {
            if ("realms" in props.access) {
                return props.options.realm !== undefined && props.access.realms.includes(props.options.realm);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
