import { UseQueryResult } from "@tanstack/react-query";

declare global {
    namespace Auth.Hooks {
        namespace UseSession {
            type Result = Session.Snapshot;
        }

        namespace UsePermission {
            type Props = Permission.Manager.Match.Props["options"];

            type Result = UseQueryResult<API.AccessControl.Privileges, Error> & {
                allowed: Optional<boolean>;
            };
        }
    }
}
