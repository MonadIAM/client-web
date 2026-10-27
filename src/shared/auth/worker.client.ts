import { CanceledError } from "axios";

import { WorkerCommand, WorkerMessageKind } from "~shared/auth/enums";
import { NotificationManager } from "~shared/notifications";
import { i18n } from "~shared/i18n";

import { SessionStatus } from "./session/enums";
import { WorkerSchema } from "./worker.schema";

class WorkerClient implements Auth.WorkerClient.Contract {
    public static readonly instance = new WorkerClient();

    public current: Auth.Session.Snapshot = { status: SessionStatus.INITIALIZING, revision: "", claims: null };
    public authorization: Optional<Promise<Auth.WorkerClient.Authorization>>;
    public initialization: Optional<Promise<void>>;
    public worker: Nullable<SharedWorker> = null;
    public initialized = false;

    public readonly pending = new Map<string, Auth.WorkerClient.Pending>();
    public readonly permissionListeners = new Set<Auth.Listener>();
    public readonly listeners = new Set<Auth.Listener>();

    private constructor() {}

    public getSnapshot(): Auth.WorkerClient.GetSnapshot.Result {
        return this.current;
    }

    public subscribe(props: Auth.WorkerClient.Subscribe.Props): Auth.WorkerClient.Subscribe.Result {
        const listener = props.listener;
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public subscribePermissions(
        props: Auth.WorkerClient.SubscribePermissions.Props,
    ): Auth.WorkerClient.SubscribePermissions.Result {
        const listener = props.listener;
        this.permissionListeners.add(listener);
        return () => {
            this.permissionListeners.delete(listener);
        };
    }

    public authorize(): Auth.WorkerClient.Authorize.Result {
        this.authorization ??= this.send({ command: WorkerCommand.AUTHORIZE })
            .then((response) => WorkerSchema.authorizeResult.parse(response).value)
            .then(
                (url) => ({ url }),
                (cause: unknown) => {
                    NotificationManager.error({ cause, title: i18n.t("errors.authorization") });
                    return { error: cause instanceof Error ? cause.message : "Authorization failed" };
                },
            );
        return this.authorization;
    }

    public retryAuthorization(): Auth.WorkerClient.RetryAuthorization.Result {
        this.authorization = undefined;
    }

    public async getToken(props: Auth.WorkerClient.GetToken.Props): Auth.WorkerClient.GetToken.Result {
        const response = await this.send({ command: WorkerCommand.TOKEN, props });
        return WorkerSchema.tokenResult.parse(response).value;
    }

    public async logout(): Auth.WorkerClient.Logout.Result {
        try {
            await this.send({ command: WorkerCommand.LOGOUT });
        } catch (error) {
            NotificationManager.error({ cause: error });
            this.publish({ ...this.current, error: error instanceof Error ? error.message : "Sign out failed" });
            throw error;
        }
    }

    public async invalidatePermissions(): Auth.WorkerClient.InvalidatePermissions.Result {
        await this.send({ command: WorkerCommand.INVALIDATE_PERMISSIONS });
    }

    public initialize(): Auth.WorkerClient.Initialize.Result {
        this.attachLifecycle();
        this.initialization ??= this.initializeSession();
        return this.initialization;
    }

    public async initializeSession(): Auth.WorkerClient.InitializeSession.Result {
        try {
            const url = new URL(location.href);
            const expected = new URL(process.env.OAUTH_REDIRECT_URI);
            const callbackAddress = url.origin === expected.origin && url.pathname === expected.pathname;
            const callbackParameters = url.searchParams.has("code") || url.searchParams.has("error");

            if (callbackAddress && callbackParameters) {
                try {
                    await this.send({ command: WorkerCommand.CALLBACK, address: url.href });
                } finally {
                    for (const name of ["code", "state", "iss", "error", "error_description"]) {
                        url.searchParams.delete(name);
                    }
                    history.replaceState(null, "", url);
                }
            }
        } catch (error) {
            NotificationManager.error({ cause: error });
            this.publish({
                ...this.current,
                status: SessionStatus.UNAVAILABLE,
                error: error instanceof Error ? error.message : "Session initialization failed",
            });
        } finally {
            await this.synchronize();
        }
    }

    public async synchronize(): Auth.WorkerClient.Synchronize.Result {
        try {
            const response = await this.send({ command: WorkerCommand.SNAPSHOT });
            const snapshot = WorkerSchema.snapshotResult.parse(response).value;
            if (snapshot.error && snapshot.error !== this.current.error) {
                NotificationManager.error({ cause: snapshot.error, logged: true, id: `worker:${snapshot.error}` });
            }
            this.publish({ ...snapshot, error: this.current.error });
        } catch (error) {
            NotificationManager.error({ cause: error });
            this.publish({
                error: error instanceof Error ? error.message : "Session synchronization failed",
                status: SessionStatus.UNAVAILABLE,
                revision: "",
                claims: null,
            });
        }
    }

    public attachLifecycle(): Auth.WorkerClient.AttachLifecycle.Result {
        if (this.initialized === false) {
            this.initialized = true;
            window.addEventListener("pagehide", () =>
                this.disconnect({ error: new CanceledError("The page was suspended") }),
            );
            window.addEventListener("pageshow", (event) => {
                if (event.persisted) {
                    this.initialization = undefined;
                    this.publish({ ...this.current, status: SessionStatus.INITIALIZING });
                    void this.initialize();
                }
            });
        }
    }

    public publish(props: Auth.WorkerClient.Publish.Props): Auth.WorkerClient.Publish.Result {
        const value = props;
        this.current = value;
        for (const listener of this.listeners) {
            listener();
        }
    }

    public connect(): Auth.WorkerClient.Connect.Result {
        if (this.worker) {
            return this.worker;
        } else {
            const worker = new SharedWorker(new URL("./worker.runner.ts", import.meta.url), {
                type: "module",
                name: "monadiam-auth",
            });
            worker.port.onmessage = (event: MessageEvent<unknown>) => {
                const response = WorkerSchema.response.safeParse(event.data);
                if (response.success) {
                    this.receive(response.data);
                } else {
                    const error = new Error("Invalid response from the session worker", { cause: response.error });
                    NotificationManager.error({ cause: error });
                    this.disconnect({ error });
                    this.publish({ status: SessionStatus.UNAVAILABLE, revision: "", claims: null, error: error.message });
                }
            };
            worker.onerror = (event) => {
                const error = new Error(event.message || "The session worker could not be started");
                NotificationManager.error({ cause: error });
                this.disconnect({ error });
                this.publish({ status: SessionStatus.UNAVAILABLE, revision: "", claims: null, error: error.message });
            };
            worker.port.start();
            this.worker = worker;
            return worker;
        }
    }

    public disconnect(props: Auth.WorkerClient.Disconnect.Props): Auth.WorkerClient.Disconnect.Result {
        const error = props.error;
        this.worker?.port.postMessage("disconnect");
        this.worker?.port.close();
        this.worker = null;
        for (const operation of this.pending.values()) {
            clearTimeout(operation.timeout);
            operation.reject(error);
        }
        this.pending.clear();
    }

    public receive(props: Auth.WorkerClient.Receive.Props): Auth.WorkerClient.Receive.Result {
        if (props.kind === WorkerMessageKind.SESSION) {
            if (props.value.error && props.value.error !== this.current.error) {
                NotificationManager.error({ cause: props.value.error, logged: true, id: `worker:${props.value.error}` });
            }
            this.publish(props.value);
        } else if (props.kind === WorkerMessageKind.PERMISSIONS) {
            for (const listener of this.permissionListeners) {
                listener();
            }
        } else {
            const operation = this.pending.get(props.id);
            if (operation) {
                clearTimeout(operation.timeout);
                this.pending.delete(props.id);
                if (props.kind === WorkerMessageKind.ERROR) {
                    const error = new Error(props.message);
                    NotificationManager.error({ cause: error, logged: true, id: `worker:${props.message}` });
                    operation.reject(error);
                } else {
                    operation.resolve(props.payload);
                }
            }
        }
    }

    public async send(props: Auth.WorkerClient.Send.Props): Auth.WorkerClient.Send.Result {
        try {
            const port = this.connect().port;
            const id = crypto.randomUUID();
            const message: Auth.Worker.Request = { id, payload: props };
            return await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.pending.delete(id);
                    reject(new Error("The session operation timed out"));
                }, Number(process.env.AUTH_WORKER_TIMEOUT_MS));
                this.pending.set(id, { resolve, reject, timeout });
                try {
                    port.postMessage(message);
                } catch (error) {
                    clearTimeout(timeout);
                    this.pending.delete(id);
                    reject(error);
                }
            });
        } catch (cause) {
            NotificationManager.error({ cause });
            throw cause;
        }
    }
}

export const AuthWorkerClient: Auth.WorkerClient.PublicContract = WorkerClient.instance;
