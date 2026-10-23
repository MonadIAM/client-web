import { WorkerSchema } from "./worker.schema";

class WorkerClient implements Auth.WorkerClient.Contract {
    public static readonly instance = new WorkerClient();

    public current: Auth.Session.Snapshot = { status: "initializing", revision: "", claims: null };
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
        this.authorization ??= this.send({ command: "authorize" })
            .then((response) => WorkerSchema.authorizeResult.parse(response).value)
            .then(
                (url) => ({ url, error: undefined }),
                (cause: unknown) => ({
                    url: undefined,
                    error: cause instanceof Error ? cause.message : "Authorization failed",
                }),
            );
        return this.authorization;
    }

    public retryAuthorization(): Auth.WorkerClient.RetryAuthorization.Result {
        this.authorization = undefined;
    }

    public async getToken(props: Auth.WorkerClient.GetToken.Props): Auth.WorkerClient.GetToken.Result {
        const response = await this.send({ command: "token", props });
        return WorkerSchema.tokenResult.parse(response).value;
    }

    public async logout(): Auth.WorkerClient.Logout.Result {
        try {
            await this.send({ command: "logout" });
        } catch (error) {
            this.publish({ ...this.current, error: error instanceof Error ? error.message : "Sign out failed" });
            throw error;
        }
    }

    public async invalidatePermissions(): Auth.WorkerClient.InvalidatePermissions.Result {
        await this.send({ command: "invalidatePermissions" });
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
                    await this.send({ command: "callback", address: url.href });
                } finally {
                    for (const name of ["code", "state", "iss", "error", "error_description"]) {
                        url.searchParams.delete(name);
                    }
                    history.replaceState(null, "", url);
                }
            }
        } catch (error) {
            this.publish({
                ...this.current,
                status: "unavailable",
                error: error instanceof Error ? error.message : "Session initialization failed",
            });
        } finally {
            await this.synchronize();
        }
    }

    public async synchronize(): Auth.WorkerClient.Synchronize.Result {
        try {
            const response = await this.send({ command: "snapshot" });
            const snapshot = WorkerSchema.snapshotResult.parse(response).value;
            this.publish({ ...snapshot, error: this.current.error });
        } catch (error) {
            this.publish({
                error: error instanceof Error ? error.message : "Session synchronization failed",
                status: "unavailable",
                revision: "",
                claims: null,
            });
        }
    }

    public attachLifecycle(): Auth.WorkerClient.AttachLifecycle.Result {
        if (this.initialized === false) {
            this.initialized = true;
            window.addEventListener("pagehide", () => this.disconnect({ error: new Error("The page was suspended") }));
            window.addEventListener("pageshow", (event) => {
                if (event.persisted) {
                    this.initialization = undefined;
                    this.publish({ ...this.current, status: "initializing" });
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
                    this.disconnect({ error: new Error("Invalid response from the session worker") });
                    this.publish({ status: "unavailable", revision: "", claims: null, error: "Invalid worker response" });
                }
            };
            worker.onerror = () => {
                const error = new Error("The session worker could not be started");
                this.disconnect({ error });
                this.publish({ status: "unavailable", revision: "", claims: null, error: error.message });
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
        if (props.kind === "session") {
            this.publish(props.value);
        } else if (props.kind === "permissions") {
            for (const listener of this.permissionListeners) {
                listener();
            }
        } else {
            const operation = this.pending.get(props.id);
            if (operation) {
                clearTimeout(operation.timeout);
                this.pending.delete(props.id);
                if (props.kind === "error") {
                    operation.reject(new Error(props.message));
                } else {
                    operation.resolve(props.payload);
                }
            }
        }
    }

    public send(props: Auth.WorkerClient.Send.Props): Auth.WorkerClient.Send.Result {
        const port = this.connect().port;
        const id = crypto.randomUUID();
        const message: Auth.Worker.Request = { id, payload: props };
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error("The session operation timed out"));
            }, Number(process.env.AUTH_WORKER_TIMEOUT_MS));
            this.pending.set(id, { resolve, reject, timeout });
            port.postMessage(message);
        });
    }
}

export const AuthWorkerClient: Auth.WorkerClient.PublicContract = WorkerClient.instance;
