import { SessionStatus } from "~src/enums";

import { SessionRepository } from "./session.repository";
import { OAuthEngine } from "../oauth/oauth.engine";

class Manager implements Auth.Session.Manager.Contract {
    public static readonly instance = new Manager();

    public stored: Auth.Session.Stored = { revision: "", identity: null };
    public refresh: Optional<Auth.Session.Manager.GetToken.Result>;
    public authorization: Optional<Auth.OAuth.Authorize.Result>;
    public loading: Optional<Promise<void>>;
    public storageError: Optional<string>;
    public writes = Promise.resolve();

    public readonly callbacks = new Map<string, Promise<void>>();
    public readonly listeners = new Set<Auth.Listener>();

    private constructor() {}

    public subscribe(props: Auth.Session.Manager.Subscribe.Props): Auth.Session.Manager.Subscribe.Result {
        const listener = props.listener;
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    public restore(): Auth.Session.Manager.Restore.Result {
        this.loading ??= this.load();
        return this.loading;
    }

    public snapshot(): Auth.Session.Snapshot {
        if (this.storageError) {
            return {
                status: SessionStatus.UNAVAILABLE,
                revision: this.stored.revision,
                error: this.storageError,
                claims: null,
            };
        } else {
            return {
                status: this.stored.identity ? SessionStatus.AUTHENTICATED : SessionStatus.ANONYMOUS,
                claims: this.stored.identity?.claims ?? null,
                revision: this.stored.revision,
            };
        }
    }

    public authorize(): Auth.OAuth.Authorize.Result {
        this.authorization ??= this.prepareAuthorization().finally(() => {
            this.authorization = undefined;
        });
        return this.authorization;
    }

    public callback(props: Auth.Session.Manager.Callback.Props): Auth.Session.Manager.Callback.Result {
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

    public async getToken(props: Auth.Session.Manager.GetToken.Props): Auth.Session.Manager.GetToken.Result {
        await this.writes;
        const sameSession = props.revision === undefined || props.revision === this.stored.revision;
        const identity = this.stored.identity;

        if (sameSession && identity) {
            const current: Auth.Session.Credential = {
                token: identity.tokens.access_token,
                revision: this.stored.revision,
            };
            const lifetime = (identity.claims.exp - identity.claims.iat) * 1e3;
            const margin = Math.min(
                Number(process.env.AUTH_REFRESH_LEEWAY_MS),
                lifetime * Number(process.env.AUTH_REFRESH_LEEWAY_RATIO),
            );
            const fresh = identity.claims.exp * 1e3 - Date.now() > margin;
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

    public async logout(): Auth.Session.Manager.Logout.Result {
        const token = this.stored.identity?.tokens.refresh_token;
        this.refresh = undefined;
        await this.commit({ revision: crypto.randomUUID(), identity: null });
        await SessionRepository.deleteTransaction();
        if (token) {
            await OAuthEngine.revoke({ token });
        }
    }

    public async load(): Auth.Session.Manager.Load.Result {
        const stored = await SessionRepository.readSession();
        if (stored) {
            this.stored = stored;
        } else {
            await this.commit({ revision: crypto.randomUUID(), identity: null });
        }
    }

    public async prepareAuthorization(): Auth.Session.Manager.PrepareAuthorization.Result {
        await this.writes;
        const stored = await SessionRepository.readTransaction();
        const active = stored && Date.now() - stored.createdAt < Number(process.env.AUTH_TRANSACTION_TTL_MS);
        const transaction: Auth.Session.Transaction =
            active && stored.revision === this.stored.revision
                ? stored
                : {
                      verifier: OAuthEngine.randomValue(),
                      state: OAuthEngine.randomValue(),
                      nonce: OAuthEngine.randomValue(),
                      revision: this.stored.revision,
                      createdAt: Date.now(),
                  };

        await SessionRepository.writeTransaction({ value: transaction });
        const url = await OAuthEngine.authorize(transaction);
        if (transaction.revision === this.stored.revision) {
            return url;
        } else {
            throw new Error("The session changed during authorization");
        }
    }

    public async commit(props: Auth.Session.Manager.Commit.Props): Auth.Session.Manager.Commit.Result {
        const stored = props;
        this.stored = stored;
        this.writes = this.writes.catch(() => undefined).then(() => SessionRepository.writeSession({ value: stored }));
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

    public async completeCallback(
        props: Auth.Session.Manager.CompleteCallback.Props,
    ): Auth.Session.Manager.CompleteCallback.Result {
        if (this.stored.completedState === props.state) {
            await this.writes;
        } else {
            const transaction = await SessionRepository.readTransaction();
            const sameState = transaction?.state === props.state;
            const sameSession = transaction?.revision === this.stored.revision;
            const active = transaction && Date.now() - transaction.createdAt < Number(process.env.AUTH_TRANSACTION_TTL_MS);

            if (transaction && sameState && sameSession && active) {
                await SessionRepository.deleteTransaction();
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

    public async refreshSession(props: Auth.Session.Manager.Refresh.Props): Auth.Session.Manager.Refresh.Result {
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

export const SessionManager: Auth.Session.Manager.PublicContract = Manager.instance;
