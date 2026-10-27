import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

import type { PermissionMatch } from "~shared/auth/permission/enums";

declare global {
    namespace Auth.Permission {
        namespace UsePermission {
            type Props = Manager.Match.Props["options"];

            type Result = UseQueryResult<API.AccessControl.Privileges, Error> & {
                allowed?: boolean;
            };

            type Signature = (props?: Props) => Result;
        }

        namespace Manager {
            type Map = API.AccessControl.Privileges["data"];

            type Access = Map[string][number];

            type Scope = Access["scope"];

            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                invalidate: Invalidate.Signature;
                matches: Match.Signature;
                list: List.Signature;
            }

            namespace Invalidate {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Match {
                type Props = {
                    permissions: Map;
                    options: {
                        codes?: string | readonly string[];
                        match?: PermissionMatch;
                        realm?: string;
                        scope?: Scope;
                    };
                };

                type Result = boolean;

                type Signature = (props: Props) => Result;
            }

            namespace List {
                type Props = {
                    signal: AbortSignal;
                };

                type Result = Promise<API.AccessControl.Privileges>;

                type Signature = (props: Props) => Result;
            }

            interface PrivateContract {
                checkAccess: CheckAccess.Signature;
            }

            namespace CheckAccess {
                type Props = {
                    options: Match.Props["options"];
                    access: Access;
                };

                type Result = boolean;

                type Signature = (props: Props) => Result;
            }
        }

        namespace Query {
            type Props = {
                session: Auth.Session.Snapshot;
            };

            type Result = UseQueryOptions<
                API.AccessControl.Privileges,
                Error,
                API.AccessControl.Privileges,
                Optional<string | string[]>[]
            >;

            type Signature = (props: Props) => Result;
        }
    }
}
