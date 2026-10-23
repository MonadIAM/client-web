import { WorkerSchema } from "./worker.schema";
import { Session } from "./session";

abstract class WorkerRunner {
    private static readonly ports = new Set<MessagePort>();

    private constructor() {}

    public static initialize(): void {
        Session.subscribe(() => this.broadcast({ kind: "session", value: Session.snapshot() }));
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
                            (payload) => this.reply(port, { kind: "result", id: request.id, payload }),
                            (error: unknown) =>
                                this.reply(port, {
                                    kind: "error",
                                    id: request.id,
                                    message: error instanceof Error ? error.message : "Authentication failed",
                                }),
                        );
                    }
                };
                port.start();
            }
        });
    }

    private static reply(port: MessagePort, response: Auth.Worker.Response): void {
        port.postMessage(response);
    }

    private static broadcast(response: Auth.Worker.Response): void {
        for (const port of this.ports) {
            this.reply(port, response);
        }
    }

    private static async execute(props: Auth.Worker.Execute.Props): Auth.Worker.Execute.Result {
        await Session.restore();
        switch (props.command) {
            case "callback": {
                await Session.callback({ address: props.address });
                return {
                    value: Session.snapshot(),
                    command: props.command,
                };
            }
            case "token": {
                return {
                    value: await Session.getToken(props.props),
                    command: props.command,
                };
            }
            case "authorize": {
                return {
                    value: await Session.authorize(),
                    command: props.command,
                };
            }
            case "snapshot": {
                return {
                    value: Session.snapshot(),
                    command: props.command,
                };
            }
            case "logout": {
                await Session.logout();
                return {
                    value: Session.snapshot(),
                    command: props.command,
                };
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

WorkerRunner.initialize();
