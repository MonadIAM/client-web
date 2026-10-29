import { z } from "zod";

import { NotificationStreamSchema } from "./worker.schema";
import { NotificationStreamCommand, NotificationStreamMessage } from "./enums";

declare global {
    namespace Notifications.Stream {
        type State = z.infer<typeof NotificationStreamSchema.state>;
        type Event = z.infer<typeof NotificationStreamSchema.event>;
        type Command = z.infer<typeof NotificationStreamSchema.command>;
        type Response = z.infer<typeof NotificationStreamSchema.response>;
        type Update = Exclude<Response, { kind: NotificationStreamMessage.TOKEN }>;
        type TokenRequest = Extract<Response, { kind: NotificationStreamMessage.TOKEN }>;
        type TokenResponse = Extract<Command, { command: NotificationStreamCommand.TOKEN }>;
        type Listener = (response: Update) => void;

        namespace WorkerRunner {
            type Subscription = {
                revision: string;
                audioReady: boolean;
            };

            type PendingToken = {
                id: string;
                revision: string;
                ports: Set<MessagePort>;

                resolve(token: string): void;
                reject(error: Error): void;
            };

            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                initialize: Initialize.Signature;
            }

            namespace Initialize {
                type Result = void;

                type Signature = () => Result;
            }

            interface PrivateContract {
                ports: Map<MessagePort, Subscription>;
                endedSessions: Set<string>;
                pendingToken: Nullable<PendingToken>;
                seen: Set<string>;
                state: State;
                controller: Nullable<AbortController>;
                reconnect: Nullable<ReturnType<typeof setTimeout>>;
                rejectedToken: Optional<string>;
                blocked: boolean;
                failures: number;

                execute: Execute.Signature;
                attach: Attach.Signature;
                detach: Detach.Signature;
                synchronize: Synchronize.Signature;
                retry: Retry.Signature;
                connect: Connect.Signature;
                stop: Stop.Signature;
                broadcast: Broadcast.Signature;
                receive: Receive.Signature;
                credential: Credential.Signature;
                acceptToken: AcceptToken.Signature;
            }

            namespace Execute {
                type Props = {
                    port: MessagePort;
                    command: Command;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Attach {
                type Props = Subscription & {
                    port: MessagePort;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Detach {
                type Props = {
                    port: MessagePort;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Synchronize {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Retry {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Connect {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Stop {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Broadcast {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Receive {
                type Props = {
                    event: Event;
                    revision: string;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Credential {
                type Props = {
                    revision: string;
                    signal: AbortSignal;
                };

                type Result = Promise<string>;

                type Signature = (props: Props) => Result;
            }

            namespace AcceptToken {
                type Props = {
                    port: MessagePort;
                    response: TokenResponse;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }
        }

        namespace WorkerClient {
            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                subscribe: Subscribe.Signature;
                audio: Audio.Signature;
                retry: Retry.Signature;
            }

            namespace Subscribe {
                type Props = {
                    listener: Listener;
                };

                type Result = Unsubscribe;

                type Signature = (props: Props) => Result;
            }

            namespace Audio {
                type Props = {
                    ready: boolean;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Retry {
                type Result = void;

                type Signature = () => Result;
            }

            interface PrivateContract {
                listeners: Set<Listener>;
                unsubscribe: Nullable<Unsubscribe>;
                worker: Nullable<SharedWorker>;
                audioReady: boolean;
                suspended: boolean;
                revision: string;

                hide: Hide.Signature;
                show: Show.Signature;
                synchronize: Synchronize.Signature;
                disconnect: Disconnect.Signature;
                connect: Connect.Signature;
                receive: Receive.Signature;
                provideToken: ProvideToken.Signature;
                publish: Publish.Signature;
            }

            namespace Hide {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Show {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Synchronize {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Disconnect {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Connect {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Receive {
                type Props = {
                    worker: SharedWorker;
                    response: Response;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace ProvideToken {
                type Props = {
                    worker: SharedWorker;
                    request: TokenRequest;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Publish {
                type Props = Update;

                type Result = void;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
