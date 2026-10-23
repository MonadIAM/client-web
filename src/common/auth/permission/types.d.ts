import type { QueryClient, UseQueryOptions } from "@tanstack/react-query";

declare global {
    namespace Auth.Permission {
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
                        match?: "all" | "any";
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

        namespace Store {
            interface PublicContract {
                client: QueryClient;
                initialize: Initialize.Signature;
                query: Query.Signature;
            }

            interface PrivateContract {
                initialized: boolean;
                revision: string;
            }

            interface Contract extends PublicContract, PrivateContract {}

            namespace Initialize {
                type Result = void;
                type Signature = () => Result;
            }

            namespace Query {
                type Props = { session: Auth.Session.Snapshot };
                type Result = UseQueryOptions<
                    API.AccessControl.Privileges,
                    Error,
                    API.AccessControl.Privileges,
                    (string | string[] | undefined)[]
                >;
                type Signature = (props: Props) => Result;
            }
        }
    }
}
