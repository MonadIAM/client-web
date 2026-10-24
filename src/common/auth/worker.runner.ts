import { WorkerSchema } from "./worker.schema";
import { SessionManager } from "./session";

class SharedWorkerRunner implements Auth.WorkerRunner.Contract {
    public static readonly instance = new SharedWorkerRunner();

    public readonly ports = new Set<MessagePort>();

    private constructor() {}

    public initialize(): Auth.WorkerRunner.Initialize.Result {
        SessionManager.subscribe({ listener: () => this.broadcast({ kind: "session", value: SessionManager.snapshot() }) });
        globalThis.addEventListener("connect", (event: Event) => {
            if (event instanceof MessageEvent) {
                const port = event.ports[0];
                this.ports.add(port);
                port.onmessage = (message: MessageEvent<unknown>) => {
                    if (message.data === "disconnect") {
                        this.ports.delete(port);
                        port.close();
                    } else {
                        const request = WorkerSchema.request.parse(message.data);
                        void this.execute(request.payload).then(
                            (payload) => this.reply({ port, response: { kind: "result", id: request.id, payload } }),
                            (error: unknown) => {
                                console.error(error);
                                this.reply({
                                    port,
                                    response: {
                                        kind: "error",
                                        id: request.id,
                                        message: error instanceof Error ? error.message : "Authentication failed",
                                    },
                                });
                            },
                        );
                    }
                };
                port.start();
            }
        });
    }

    public reply(props: Auth.WorkerRunner.Reply.Props): Auth.WorkerRunner.Reply.Result {
        props.port.postMessage(props.response);
    }

    public broadcast(props: Auth.WorkerRunner.Broadcast.Props): Auth.WorkerRunner.Broadcast.Result {
        for (const port of this.ports) {
            this.reply({ port, response: props });
        }
    }

    public async execute(props: Auth.WorkerRunner.Execute.Props): Auth.WorkerRunner.Execute.Result {
        await SessionManager.restore();
        switch (props.command) {
            case "callback": {
                await SessionManager.callback({ address: props.address });
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case "token": {
                return { value: await SessionManager.getToken(props.props), command: props.command };
            }
            case "authorize": {
                return { value: await SessionManager.authorize(), command: props.command };
            }
            case "snapshot": {
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case "logout": {
                await SessionManager.logout();
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case "invalidatePermissions": {
                this.broadcast({ kind: "permissions" });
                return { command: props.command };
            }
            default: {
                const unsupported: never = props;
                throw new Error(`Unsupported worker command: ${String(unsupported)}`);
            }
        }
    }
}

export const WorkerRunner: Auth.WorkerRunner.PublicContract = SharedWorkerRunner.instance;

WorkerRunner.initialize();
