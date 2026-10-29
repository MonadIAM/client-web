import { AuthWorkerClient } from "~shared/auth/worker.client";
import { SessionStatus } from "~shared/auth/session/enums";

import { NotificationStreamCommand, NotificationStreamMessage, NotificationStreamStatus } from "./enums";
import { NotificationStreamSchema } from "./worker.schema";

class NotificationWorkerClient implements Notifications.Stream.WorkerClient.Contract {
    public static readonly instance = new NotificationWorkerClient();

    public readonly listeners = new Set<Notifications.Stream.Listener>();
    public unsubscribe: Nullable<Notifications.Unsubscribe> = null;
    public worker: Nullable<SharedWorker> = null;
    public audioReady = false;
    public suspended = false;
    public revision = "";

    public readonly hide: Notifications.Stream.WorkerClient.Hide.Signature = () => {
        this.suspended = true;
        this.disconnect();
    };

    public readonly show: Notifications.Stream.WorkerClient.Show.Signature = () => {
        this.suspended = false;
        this.synchronize();
    };

    private constructor() {}

    public subscribe(
        props: Notifications.Stream.WorkerClient.Subscribe.Props,
    ): Notifications.Stream.WorkerClient.Subscribe.Result {
        this.listeners.add(props.listener);
        if (!this.unsubscribe) {
            this.unsubscribe = AuthWorkerClient.subscribe({ listener: () => this.synchronize() });
            window.addEventListener("pagehide", this.hide);
            window.addEventListener("pageshow", this.show);
        }
        this.synchronize();

        return () => {
            this.listeners.delete(props.listener);
            if (this.listeners.size === 0) {
                this.audioReady = false;
                this.disconnect();
                this.unsubscribe?.();
                this.unsubscribe = null;
                window.removeEventListener("pagehide", this.hide);
                window.removeEventListener("pageshow", this.show);
            }
        };
    }

    public synchronize(): Notifications.Stream.WorkerClient.Synchronize.Result {
        const session = AuthWorkerClient.getSnapshot();
        if (this.worker && (session.status !== SessionStatus.AUTHENTICATED || session.revision !== this.revision)) {
            if (session.status === SessionStatus.ANONYMOUS || session.revision !== this.revision) {
                this.worker.port.postMessage({ command: NotificationStreamCommand.END_SESSION, revision: this.revision });
            }
            this.disconnect();
        }
        if (!this.worker && !this.suspended && this.listeners.size > 0 && session.status === SessionStatus.AUTHENTICATED) {
            this.revision = session.revision;
            this.connect();
        }
    }

    public connect(): Notifications.Stream.WorkerClient.Connect.Result {
        this.publish({
            kind: NotificationStreamMessage.STATE,
            value: { revision: this.revision, count: null, status: NotificationStreamStatus.CONNECTING },
        });
        try {
            const worker = new SharedWorker(new URL("./worker.runner.ts", import.meta.url), {
                type: "module",
                name: "monadiam-notifications",
            });
            this.worker = worker;
            worker.port.onmessage = (event: MessageEvent<unknown>) => {
                if (this.worker === worker) {
                    const response = NotificationStreamSchema.response.safeParse(event.data);
                    if (response.success) {
                        this.receive({ worker, response: response.data });
                    } else {
                        this.disconnect();
                        this.publish({
                            kind: NotificationStreamMessage.STATE,
                            value: { revision: this.revision, count: null, status: NotificationStreamStatus.ERROR },
                        });
                    }
                }
            };
            worker.onerror = () => {
                if (this.worker === worker) {
                    this.disconnect();
                    this.publish({
                        kind: NotificationStreamMessage.STATE,
                        value: { revision: this.revision, count: null, status: NotificationStreamStatus.ERROR },
                    });
                }
            };
            worker.port.start();
            worker.port.postMessage({
                command: NotificationStreamCommand.ATTACH,
                revision: this.revision,
                audioReady: this.audioReady,
            });
        } catch {
            this.disconnect();
            this.publish({
                kind: NotificationStreamMessage.STATE,
                value: { revision: this.revision, count: null, status: NotificationStreamStatus.ERROR },
            });
        }
    }

    public disconnect(): Notifications.Stream.WorkerClient.Disconnect.Result {
        const worker = this.worker;
        this.worker = null;
        worker?.port.postMessage({ command: NotificationStreamCommand.DETACH });
        worker?.port.close();
    }

    public audio(props: Notifications.Stream.WorkerClient.Audio.Props): Notifications.Stream.WorkerClient.Audio.Result {
        this.audioReady = props.ready;
        this.worker?.port.postMessage({
            command: NotificationStreamCommand.AUDIO,
            revision: this.revision,
            audioReady: props.ready,
        });
    }

    public retry(): Notifications.Stream.WorkerClient.Retry.Result {
        if (this.worker) {
            this.worker.port.postMessage({ command: NotificationStreamCommand.RETRY });
        } else {
            this.synchronize();
        }
    }

    public receive(
        props: Notifications.Stream.WorkerClient.Receive.Props,
    ): Notifications.Stream.WorkerClient.Receive.Result {
        if (this.worker === props.worker) {
            if (props.response.kind === NotificationStreamMessage.TOKEN) {
                void this.provideToken({ worker: props.worker, request: props.response });
            } else {
                this.publish(props.response);
            }
        }
    }

    public async provideToken(
        props: Notifications.Stream.WorkerClient.ProvideToken.Props,
    ): Notifications.Stream.WorkerClient.ProvideToken.Result {
        const { worker, request } = props;
        let token: Nullable<string> = null;
        try {
            const credential = await AuthWorkerClient.getToken({
                revision: request.revision,
                rejectedToken: request.rejectedToken,
            });
            const session = AuthWorkerClient.getSnapshot();
            if (session.revision === request.revision && session.status === SessionStatus.AUTHENTICATED) {
                token = credential.token;
            }
        } catch {
            token = null;
        }
        if (this.worker === worker) {
            worker.port.postMessage({
                command: NotificationStreamCommand.TOKEN,
                id: request.id,
                revision: request.revision,
                token,
            });
        }
    }

    public publish(
        props: Notifications.Stream.WorkerClient.Publish.Props,
    ): Notifications.Stream.WorkerClient.Publish.Result {
        for (const listener of this.listeners) {
            listener(props);
        }
    }
}

export const NotificationStreamClient: Notifications.Stream.WorkerClient.PublicContract = NotificationWorkerClient.instance;
