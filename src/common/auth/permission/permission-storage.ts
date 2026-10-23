import { QueryClient, queryOptions } from "@tanstack/react-query";

import { Permission } from "./permission";
import { AuthClient } from "../client";

export abstract class PermissionStorage {
    public static readonly client = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    private static initialized = false;
    private static revision = "";

    private constructor() {}

    public static initialize(): void {
        if (this.initialized === false) {
            this.initialized = true;
            AuthClient.subscribe(() => {
                const session = AuthClient.getSnapshot();
                if (session.revision !== this.revision) {
                    this.revision = session.revision;
                    this.client.clear();
                }
            });
            AuthClient.subscribePermissions(() => {
                void this.client.invalidateQueries({
                    queryKey: ["permissions"],
                });
            });
        }
    }

    public static query(session: Auth.Session.Snapshot) {
        return queryOptions({
            queryKey: ["permissions", session.revision, session.claims?.realms],
            queryFn: ({ signal }) => Permission.list(signal),
            enabled: session.status === "authenticated",
            staleTime: Number(process.env.AUTH_PERMISSION_STALE_TIME_MS),
        });
    }
}
