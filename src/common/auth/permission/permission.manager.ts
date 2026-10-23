import { AccessControl } from "~api/sdk";

import { AuthWorkerClient } from "../worker.client";

class Manager implements Auth.Permission.Manager.Contract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async list(props: Auth.Permission.Manager.List.Props): Promise<API.AccessControl.Privileges> {
        const response = await AccessControl.permissionControllerGetPrivileges({
            signal: props.signal,
            throwOnError: true,
        });
        return response.data;
    }

    public matches(props: Auth.Permission.Manager.Match.Props): Auth.Permission.Manager.Match.Result {
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

    public invalidate(): Promise<void> {
        return AuthWorkerClient.invalidatePermissions();
    }

    public checkAccess(props: Auth.Permission.Manager.CheckAccess.Props): Auth.Permission.Manager.CheckAccess.Result {
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

export const PermissionManager: Auth.Permission.Manager.PublicContract = Manager.instance;
