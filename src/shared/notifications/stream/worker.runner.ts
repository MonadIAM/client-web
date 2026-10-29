import { EventSourceParserStream } from "eventsource-parser/stream";

import { NotificationStreamCommand, NotificationStreamMessage, NotificationStreamStatus } from "./enums";
import { NotificationStreamSchema } from "./worker.schema";

class NotificationStreamWorker implements Notifications.Stream.WorkerRunner.Contract {
    public static readonly instance = new NotificationStreamWorker();

    public readonly ports = new Map<MessagePort, Notifications.Stream.WorkerRunner.Subscription>();
    public readonly endedSessions = new Set<string>();
    public readonly seen = new Set<string>();

    public state: Notifications.Stream.State = { revision: "", count: null, status: NotificationStreamStatus.CONNECTING };
    public pendingToken: Nullable<Notifications.Stream.WorkerRunner.PendingToken> = null;
    public reconnect: Nullable<ReturnType<typeof setTimeout>> = null;
    public controller: Nullable<AbortController> = null;
    public rejectedToken: Optional<string>;
    public blocked = false;
    public failures = 0;

    private constructor() {}

    public initialize(): Notifications.Stream.WorkerRunner.Initialize.Result {
        globalThis.addEventListener("connect", (event: Event) => {
            if (event instanceof MessageEvent) {
                const port = event.ports[0];
                port.onmessage = (message: MessageEvent<unknown>) => {
                    const parsed = NotificationStreamSchema.command.safeParse(message.data);
                    if (parsed.success) {
                        this.execute({ port, command: parsed.data });
                    } else {
                        this.detach({ port });
                    }
                };
                port.onmessageerror = () => this.detach({ port });
                port.start();
            }
        });
    }

    public execute({
        port,
        command,
    }: Notifications.Stream.WorkerRunner.Execute.Props): Notifications.Stream.WorkerRunner.Execute.Result {
        switch (command.command) {
            case NotificationStreamCommand.ATTACH: {
                this.attach({ port, revision: command.revision, audioReady: command.audioReady });
                break;
            }
            case NotificationStreamCommand.DETACH: {
                this.detach({ port });
                break;
            }
            case NotificationStreamCommand.AUDIO: {
                const subscription = this.ports.get(port);
                if (subscription?.revision === command.revision) {
                    subscription.audioReady = command.audioReady;
                }
                break;
            }
            case NotificationStreamCommand.RETRY: {
                if (this.ports.get(port)?.revision === this.state.revision) {
                    this.retry();
                }
                break;
            }
            case NotificationStreamCommand.TOKEN: {
                this.acceptToken({ port, response: command });
                break;
            }
            case NotificationStreamCommand.END_SESSION: {
                this.endedSessions.add(command.revision);
                if (this.state.revision === command.revision) {
                    this.stop();
                    this.state = { revision: command.revision, count: null, status: NotificationStreamStatus.CONNECTING };
                    this.seen.clear();
                    this.rejectedToken = undefined;
                    this.broadcast();
                }
                break;
            }
        }
    }

    public attach(props: Notifications.Stream.WorkerRunner.Attach.Props): Notifications.Stream.WorkerRunner.Attach.Result {
        if (!this.endedSessions.has(props.revision)) {
            if (this.state.revision !== props.revision) {
                if (this.state.revision) {
                    this.endedSessions.add(this.state.revision);
                }
                this.stop();
                this.state = { revision: props.revision, count: null, status: NotificationStreamStatus.CONNECTING };
                this.rejectedToken = undefined;
                this.failures = 0;
                this.blocked = false;
                this.seen.clear();
            }
            this.ports.set(props.port, { revision: props.revision, audioReady: props.audioReady });
            if (this.pendingToken?.revision === props.revision) {
                this.pendingToken.ports.add(props.port);
                props.port.postMessage({
                    kind: NotificationStreamMessage.TOKEN,
                    rejectedToken: this.rejectedToken,
                    revision: props.revision,
                    id: this.pendingToken.id,
                });
            }
            props.port.postMessage({ kind: NotificationStreamMessage.STATE, value: this.state });
            this.synchronize();
        }
    }

    public detach(props: Notifications.Stream.WorkerRunner.Detach.Props): Notifications.Stream.WorkerRunner.Detach.Result {
        this.ports.delete(props.port);
        this.pendingToken?.ports.delete(props.port);
        if (this.pendingToken?.ports.size === 0) {
            this.pendingToken.reject(new Error("No notification clients can provide authorization"));
        }
        props.port.close();
        this.synchronize();
    }

    public synchronize(): Notifications.Stream.WorkerRunner.Synchronize.Result {
        const connected = Array.from(this.ports.values()).some((port) => port.revision === this.state.revision);
        if (!connected || this.endedSessions.has(this.state.revision)) {
            this.stop();
        } else if (!this.blocked && !this.controller && !this.reconnect) {
            void this.connect();
        }
    }

    public retry(): Notifications.Stream.WorkerRunner.Retry.Result {
        this.blocked = false;
        this.stop();
        if (this.state.count === null) {
            this.state = { ...this.state, status: NotificationStreamStatus.CONNECTING };
        } else {
            this.state = { ...this.state, status: NotificationStreamStatus.RECONNECTING };
        }
        this.failures = 0;
        this.broadcast();
        this.synchronize();
    }

    public stop(): Notifications.Stream.WorkerRunner.Stop.Result {
        if (this.reconnect) {
            clearTimeout(this.reconnect);
            this.reconnect = null;
        }
        this.controller?.abort();
        this.controller = null;
    }

    public broadcast(): Notifications.Stream.WorkerRunner.Broadcast.Result {
        for (const [port, subscription] of this.ports) {
            if (subscription.revision === this.state.revision) {
                port.postMessage({ kind: NotificationStreamMessage.STATE, value: this.state });
            }
        }
    }

    public receive(
        props: Notifications.Stream.WorkerRunner.Receive.Props,
    ): Notifications.Stream.WorkerRunner.Receive.Result {
        const { event, revision } = props;
        this.state = { revision, count: event.count, status: NotificationStreamStatus.CONNECTED };
        this.failures = 0;
        this.broadcast();
        if (event.message && !this.seen.has(event.message)) {
            this.seen.add(event.message);
            if (this.seen.size > 1000) {
                const oldest = this.seen.values().next().value;
                if (oldest) {
                    this.seen.delete(oldest);
                }
            }
            if (event.soundEnabled) {
                for (const [port, subscription] of this.ports) {
                    if (subscription.audioReady && subscription.revision === revision) {
                        port.postMessage({ kind: NotificationStreamMessage.SOUND, revision, message: event.message });
                        break;
                    }
                }
            }
        }
    }

    public async credential(
        props: Notifications.Stream.WorkerRunner.Credential.Props,
    ): Notifications.Stream.WorkerRunner.Credential.Result {
        const id = crypto.randomUUID();
        const ports = new Set<MessagePort>();
        for (const [port, subscription] of this.ports) {
            if (subscription.revision === props.revision) {
                ports.add(port);
            }
        }
        const cancel = () => {
            if (this.pendingToken?.id === id) {
                this.pendingToken.reject(new Error("Notification authorization was cancelled"));
            }
        };
        const timeout = setTimeout(cancel, 10_000);
        props.signal.addEventListener("abort", cancel, { once: true });
        try {
            return await new Promise<string>((resolve, reject) => {
                this.pendingToken = { id, revision: props.revision, ports, resolve, reject };
                for (const port of ports) {
                    port.postMessage({
                        kind: NotificationStreamMessage.TOKEN,
                        id,
                        revision: props.revision,
                        rejectedToken: this.rejectedToken,
                    });
                }
            });
        } finally {
            clearTimeout(timeout);
            props.signal.removeEventListener("abort", cancel);
            if (this.pendingToken?.id === id) {
                this.pendingToken = null;
            }
        }
    }

    public acceptToken(
        props: Notifications.Stream.WorkerRunner.AcceptToken.Props,
    ): Notifications.Stream.WorkerRunner.AcceptToken.Result {
        const pending = this.pendingToken;
        const { response, port } = props;
        if (pending?.id === response.id && pending.revision === response.revision && pending.ports.has(port)) {
            if (response.token) {
                pending.resolve(response.token);
            } else {
                pending.ports.delete(port);
                if (pending.ports.size === 0) {
                    pending.reject(new Error("Notification authorization is unavailable"));
                }
            }
        }
    }

    public async connect(): Notifications.Stream.WorkerRunner.Connect.Result {
        const revision = this.state.revision;
        const controller = new AbortController();
        this.controller = controller;
        let watchdog: Optional<ReturnType<typeof setTimeout>>;
        const touch = () => {
            clearTimeout(watchdog);
            watchdog = setTimeout(() => controller.abort(), 45_000);
        };
        touch();

        try {
            const token = await this.credential({ revision, signal: controller.signal });
            const response = await fetch(
                new URL("/api/v1/notification/unread-count/stream", process.env.NOTIFICATION_ORIGIN),
                {
                    headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                    cache: "no-store",
                },
            );
            if (this.controller !== controller) {
                await response.body?.cancel();
                throw new Error("The notification session has changed");
            } else if (!response.ok) {
                const challenge = response.headers.get("www-authenticate") ?? "";
                const invalidToken = /\bBearer\b/i.test(challenge) && /\berror="?invalid_token"?(?:\s|,|$)/.test(challenge);
                if (response.status === 401 && invalidToken && !this.rejectedToken) {
                    this.rejectedToken = token;
                } else if (response.status === 401 || response.status === 403) {
                    this.blocked = true;
                }
                await response.body?.cancel();
                throw new Error(`Notification stream request failed: ${response.status}`);
            } else if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
                await response.body?.cancel();
                throw new Error("Expected a notification event stream");
            }
            this.rejectedToken = undefined;
            await response.body
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(new EventSourceParserStream({ maxBufferSize: 65_536, onError: "terminate" }))
                .pipeTo(
                    new WritableStream({
                        write: (value) => {
                            touch();
                            if (value.event === "error") {
                                throw new Error("The notification stream was interrupted");
                            } else if (
                                value.event === "unread-count" &&
                                this.controller === controller &&
                                this.state.revision === revision
                            ) {
                                this.receive({
                                    event: NotificationStreamSchema.event.parse(JSON.parse(value.data)),
                                    revision,
                                });
                            }
                        },
                    }),
                    { signal: controller.signal },
                );
        } catch (error) {
            if (this.controller === controller) {
                console.error(error);
                this.failures += 1;
                if (this.blocked || this.failures >= 3) {
                    this.state = { ...this.state, status: NotificationStreamStatus.ERROR };
                } else {
                    this.state = { ...this.state, status: NotificationStreamStatus.RECONNECTING };
                }
                this.broadcast();
            }
        } finally {
            controller.abort();
            clearTimeout(watchdog);
            if (this.controller === controller) {
                this.controller = null;
                if (!this.blocked) {
                    if (this.state.status === NotificationStreamStatus.CONNECTED) {
                        this.state = { ...this.state, status: NotificationStreamStatus.RECONNECTING };
                        this.broadcast();
                    }
                    this.reconnect = setTimeout(
                        () => {
                            this.reconnect = null;
                            this.synchronize();
                        },
                        Math.min(30_000, 1000 * 2 ** Math.min(this.failures, 5)) + Math.random() * 500,
                    );
                }
            }
        }
    }
}

export const NotificationStreamRunner: Notifications.Stream.WorkerRunner.PublicContract = NotificationStreamWorker.instance;

NotificationStreamRunner.initialize();
