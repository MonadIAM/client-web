import { SessionStorage } from "./session-storage";
import { OAuthEngine } from "../oauth.engine";

export abstract class Session {
    private static stored: Auth.Session.Stored = { revision: "", identity: null };
    private static refresh: Optional<Auth.Session.GetToken.Result>;
    private static authorization: Optional<Auth.OAuth.Authorize.Result>;
    private static loading: Optional<Promise<void>>;
    private static storageError: Optional<string>;
    private static writes = Promise.resolve();
    private static readonly callbacks = new Map<string, Promise<void>>();
    private static readonly listeners = new Set<Auth.Listener>();

    private constructor() {}

    public static subscribe(listener: Auth.Listener): Auth.Unsubscribe {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public static restore(): Promise<void> {
        this.loading ??= this.load();
        return this.loading;
    }

    public static snapshot(): Auth.Session.Snapshot {
        if (this.storageError) {
            return {
                status: "unavailable",
                revision: this.stored.revision,
                error: this.storageError,
                claims: null,
            };
        } else {
            return {
                status: this.stored.identity ? "authenticated" : "anonymous",
                claims: this.stored.identity?.claims ?? null,
                revision: this.stored.revision,
            };
        }
    }

    public static authorize(): Auth.OAuth.Authorize.Result {
        this.authorization ??= this.prepareAuthorization().finally(() => {
            this.authorization = undefined;
        });
        return this.authorization;
    }

    public static callback(props: Auth.Session.Callback.Props): Auth.Session.Callback.Result {
        const url = new URL(props.address);
        const state = url.searchParams.get("state");
        if (state) {
            const pending = this.callbacks.get(state);
            if (pending) {
                return pending;
            } else {
                const operation = this.completeCallback({ url, state }).finally(() => {
                    this.callbacks.delete(state);
                });
                this.callbacks.set(state, operation);
                return operation;
            }
        } else {
            return Promise.reject(new Error("The authorization callback has no state"));
        }
    }

    public static async getToken(props: Auth.Session.GetToken.Props): Auth.Session.GetToken.Result {
        await this.writes;
        const sameSession = props.revision === undefined || props.revision === this.stored.revision;
        const identity = this.stored.identity;

        if (sameSession && identity) {
            const current: Auth.Session.Credential = {
                token: identity.tokens.access_token,
                revision: this.stored.revision,
            };
            const lifetime = (identity.claims.exp - identity.claims.iat) * 1000;
            const margin = Math.min(
                Number(process.env.AUTH_REFRESH_LEEWAY_MS),
                lifetime * Number(process.env.AUTH_REFRESH_LEEWAY_RATIO),
            );
            const fresh = identity.claims.exp * 1000 - Date.now() > margin;
            const accepted = props.rejectedToken === undefined || props.rejectedToken !== current.token;

            if (fresh && accepted) {
                return current;
            } else if (this.refresh) {
                return this.refresh;
            } else {
                const operation = this.refreshSession({ previous: this.stored, identity });
                this.refresh = operation;
                try {
                    return await operation;
                } finally {
                    if (this.refresh === operation) {
                        this.refresh = undefined;
                    }
                }
            }
        } else {
            throw new Error("The session has ended or changed");
        }
    }

    public static async logout(): Promise<void> {
        const token = this.stored.identity?.tokens.refresh_token;
        this.refresh = undefined;
        await this.commit({ revision: crypto.randomUUID(), identity: null });
        await SessionStorage.deleteTransaction();
        if (token) {
            await OAuthEngine.revoke({ token });
        }
    }

    private static async load(): Promise<void> {
        const stored = await SessionStorage.readSession();
        if (stored) {
            this.stored = stored;
        } else {
            await this.commit({ revision: crypto.randomUUID(), identity: null });
        }
    }

    private static async prepareAuthorization(): Auth.OAuth.Authorize.Result {
        await this.writes;
        const stored = await SessionStorage.readTransaction();
        const active = stored && Date.now() - stored.createdAt < Number(process.env.AUTH_TRANSACTION_TTL_MS);
        const transaction: Auth.Session.Transaction =
            active && stored.revision === this.stored.revision
                ? stored
                : {
                      state: OAuthEngine.randomValue(),
                      nonce: OAuthEngine.randomValue(),
                      verifier: OAuthEngine.randomValue(),
                      revision: this.stored.revision,
                      createdAt: Date.now(),
                  };

        await SessionStorage.writeTransaction(transaction);
        const url = await OAuthEngine.authorize(transaction);
        if (transaction.revision === this.stored.revision) {
            return url;
        } else {
            throw new Error("The session changed during authorization");
        }
    }

    private static async commit(stored: Auth.Session.Stored): Promise<void> {
        this.stored = stored;
        this.writes = this.writes.catch(() => undefined).then(() => SessionStorage.writeSession(stored));
        try {
            await this.writes;
            this.storageError = undefined;
        } catch (error) {
            this.storageError = "Session storage is unavailable";
            throw error;
        } finally {
            for (const listener of this.listeners) {
                listener();
            }
        }
    }

    private static async completeCallback(
        props: Auth.Session.CompleteCallback.Props,
    ): Auth.Session.CompleteCallback.Result {
        if (this.stored.completedState === props.state) {
            await this.writes;
        } else {
            const transaction = await SessionStorage.readTransaction();
            const sameState = transaction?.state === props.state;
            const sameSession = transaction?.revision === this.stored.revision;
            const active = transaction && Date.now() - transaction.createdAt < Number(process.env.AUTH_TRANSACTION_TTL_MS);

            if (transaction && sameState && sameSession && active) {
                await SessionStorage.deleteTransaction();
                const identity = await OAuthEngine.exchange({ url: props.url, transaction });

                if (transaction.revision === this.stored.revision) {
                    this.refresh = undefined;
                    await this.commit({ identity, revision: crypto.randomUUID(), completedState: props.state });
                } else {
                    await OAuthEngine.revoke({ token: identity.tokens.refresh_token });
                    throw new Error("The session changed during authentication");
                }
            } else {
                throw new Error("The authorization request has expired or changed");
            }
        }
    }

    private static async refreshSession(props: Auth.Session.Refresh.Props): Auth.Session.Refresh.Result {
        try {
            const identity = await OAuthEngine.refresh({ token: props.identity.tokens.refresh_token });
            const sameSession = this.stored.revision === props.previous.revision;
            const sameIdentity =
                identity.claims.sid === props.identity.claims.sid && identity.claims.sub === props.identity.claims.sub;

            if (sameSession && sameIdentity) {
                await this.commit({ ...props.previous, identity });
                if (this.stored.revision === props.previous.revision) {
                    return { token: identity.tokens.access_token, revision: props.previous.revision };
                } else {
                    throw new Error("The session changed during token refresh");
                }
            } else {
                await OAuthEngine.revoke({ token: identity.tokens.refresh_token });
                throw new Error("The session identity changed during token refresh");
            }
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "invalid_grant" &&
                this.stored.revision === props.previous.revision
            ) {
                await this.commit({ revision: crypto.randomUUID(), identity: null });
                throw error;
            } else {
                throw error;
            }
        }
    }
}
