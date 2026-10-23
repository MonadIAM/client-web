import { WorkerSchema } from "./worker.schema";

export abstract class AuthClient {
    private static current: Auth.Session.Snapshot = { status: "initializing", revision: "", claims: null };
    private static worker: Nullable<SharedWorker> = null;
    private static initialized = false;
    private static readonly pending = new Map<string, Auth.Client.Pending>();
    private static readonly permissionListeners = new Set<Auth.Listener>();
    private static readonly listeners = new Set<Auth.Listener>();

    private constructor() {}

    public static getSnapshot(): Auth.Session.Snapshot {
        return this.current;
    }

    public static subscribe(listener: Auth.Listener): Auth.Unsubscribe {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public static subscribePermissions(listener: Auth.Listener): Auth.Unsubscribe {
        this.permissionListeners.add(listener);
        return () => {
            this.permissionListeners.delete(listener);
        };
    }

    public static async authorize(): Promise<string> {
        const response = await this.send({ command: "authorize" });
        return WorkerSchema.authorizeResult.parse(response).value;
    }

    public static async getToken(props: Auth.Session.GetToken.Props): Auth.Session.GetToken.Result {
        const response = await this.send({ command: "token", props });
        return WorkerSchema.tokenResult.parse(response).value;
    }

    public static async logout(): Promise<void> {
        try {
            await this.send({ command: "logout" });
        } catch (error) {
            this.publish({ ...this.current, error: error instanceof Error ? error.message : "Sign out failed" });
            throw error;
        }
    }

    public static async invalidatePermissions(): Promise<void> {
        await this.send({ command: "invalidatePermissions" });
    }

    public static async initialize(): Promise<void> {
        this.attachLifecycle();
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

    private static async synchronize(): Promise<void> {
        try {
            const response = await this.send({ command: "snapshot" });
            const snapshot = WorkerSchema.snapshotResult.parse(response).value;
            this.publish({ ...snapshot, error: this.current.error });
        } catch (error) {
            this.publish({
                status: "unavailable",
                revision: "",
                claims: null,
                error: error instanceof Error ? error.message : "Session synchronization failed",
            });
        }
    }

    private static attachLifecycle(): void {
        if (this.initialized === false) {
            this.initialized = true;
            window.addEventListener("pagehide", () => this.disconnect(new Error("The page was suspended")));
            window.addEventListener("pageshow", (event) => {
                if (event.persisted) {
                    void this.initialize();
                }
            });
        }
    }

    private static publish(value: Auth.Session.Snapshot): void {
        this.current = value;
        for (const listener of this.listeners) {
            listener();
        }
    }

    private static connect(): SharedWorker {
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
                    this.disconnect(new Error("Invalid response from the session worker"));
                    this.publish({ status: "unavailable", revision: "", claims: null, error: "Invalid worker response" });
                }
            };
            worker.onerror = () => {
                const error = new Error("The session worker could not be started");
                this.disconnect(error);
                this.publish({ status: "unavailable", revision: "", claims: null, error: error.message });
            };
            worker.port.start();
            this.worker = worker;
            return worker;
        }
    }

    private static disconnect(error: Error): void {
        this.worker?.port.postMessage("disconnect");
        this.worker?.port.close();
        this.worker = null;
        for (const operation of this.pending.values()) {
            clearTimeout(operation.timeout);
            operation.reject(error);
        }
        this.pending.clear();
    }

    private static receive(props: Auth.Client.Receive.Props): Auth.Client.Receive.Result {
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

    private static send(props: Auth.Client.Send.Props): Auth.Client.Send.Result {
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
