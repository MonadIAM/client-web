import { IdentitySDK } from "~shared/api/sdk";

import { SessionsSchema } from "./schema";

class Manager implements Sessions.Manager.PublicContract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async list({ signal, currentId }: Sessions.Manager.List.Props): Sessions.Manager.List.Result {
        const response = await IdentitySDK.authnControllerGetSessions({ signal, throwOnError: true });
        const { data } = SessionsSchema.list.parse(response.data);
        const now = Date.now();

        return data
            .filter((session) => !session.expiresAt || Date.parse(session.expiresAt) > now)
            .sort((first, second) => {
                const currentOrder = Number(second.id === currentId) - Number(first.id === currentId);
                const firstUpdatedAt = first.lastRefreshedAt ?? first.createdAt;
                const secondUpdatedAt = second.lastRefreshedAt ?? second.createdAt;
                const updatedAtOrder = secondUpdatedAt.localeCompare(firstUpdatedAt);

                return currentOrder || updatedAtOrder || first.id.localeCompare(second.id);
            });
    }

    public async revoke(props: Sessions.Manager.Revoke.Props): Sessions.Manager.Revoke.Result {
        const { sessions } = SessionsSchema.revoke.parse(props);

        await IdentitySDK.authnControllerRevokeSessions({
            body: { sessions },
            throwOnError: true,
        });
    }

    public async revokeAll(): Sessions.Manager.RevokeAll.Result {
        await IdentitySDK.authnControllerRevokeAllSessions({ throwOnError: true });
    }
}

export const SessionsManager: Sessions.Manager.PublicContract = Manager.instance;
