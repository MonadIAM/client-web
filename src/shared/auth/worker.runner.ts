import { WorkerCommand, WorkerMessageKind } from "~shared/auth/enums";

import { SessionManager } from "./session/session.manager";
import { WorkerSchema } from "./worker.schema";

class SharedWorkerRunner implements Auth.WorkerRunner.Contract {
    public static readonly instance = new SharedWorkerRunner();

    public readonly ports = new Set<MessagePort>();

    private constructor() {}

    public initialize(): Auth.WorkerRunner.Initialize.Result {
        SessionManager.subscribe({
            listener: () => this.broadcast({ kind: WorkerMessageKind.SESSION, value: SessionManager.snapshot() }),
        });
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
                            (payload) =>
                                this.reply({ port, response: { kind: WorkerMessageKind.RESULT, id: request.id, payload } }),
                            (error: unknown) => {
                                console.error(error);
                                this.reply({
                                    port,
                                    response: {
                                        kind: WorkerMessageKind.ERROR,
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
            case WorkerCommand.CALLBACK: {
                await SessionManager.callback({ address: props.address });
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case WorkerCommand.TOKEN: {
                return { value: await SessionManager.getToken(props.props), command: props.command };
            }
            case WorkerCommand.AUTHORIZE: {
                return { value: await SessionManager.authorize(), command: props.command };
            }
            case WorkerCommand.SNAPSHOT: {
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case WorkerCommand.LOGOUT: {
                await SessionManager.logout();
                return { value: SessionManager.snapshot(), command: props.command };
            }
            case WorkerCommand.INVALIDATE_PERMISSIONS: {
                this.broadcast({ kind: WorkerMessageKind.PERMISSIONS });
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
