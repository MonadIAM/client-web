import { QueryClient, queryOptions } from "@tanstack/react-query";

import { PermissionManager } from "./permission.manager";
import { AuthWorkerClient } from "../worker.client";

class Store {
    public static readonly instance = new Store();

    public readonly client = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false },
        },
    });

    public initialized = false;
    public revision = "";

    private constructor() {}

    public initialize(): void {
        if (this.initialized === false) {
            this.initialized = true;
            AuthWorkerClient.subscribe({
                listener: () => {
                    const session = AuthWorkerClient.getSnapshot();
                    if (session.revision !== this.revision) {
                        this.revision = session.revision;
                        this.client.clear();
                    }
                },
            });
            AuthWorkerClient.subscribePermissions({
                listener: () => {
                    void this.client.invalidateQueries({
                        queryKey: ["permissions"],
                    });
                },
            });
        }
    }

    public query(props: Auth.Permission.Store.Query.Props): Auth.Permission.Store.Query.Result {
        const session = props.session;
        return queryOptions({
            queryKey: ["permissions", session.revision, session.claims?.realms],
            staleTime: Number(process.env.AUTH_PERMISSION_STALE_TIME_MS),
            queryFn: ({ signal }) => PermissionManager.list({ signal }),
            enabled: session.status === "authenticated",
        });
    }
}

export const PermissionStore: Auth.Permission.Store.PublicContract = Store.instance;
