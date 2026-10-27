import { z } from "zod";

import { WorkerSchema } from "./worker.schema";

declare global {
    namespace Auth {
        type Listener = () => void;

        type Unsubscribe = () => void;

        namespace Worker {
            type Response = z.infer<typeof WorkerSchema.response>;

            type Command = z.infer<typeof WorkerSchema.command>;

            type Request = z.infer<typeof WorkerSchema.request>;

            type Payload = z.infer<typeof WorkerSchema.payload>;
        }

        namespace WorkerRunner {
            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                initialize: Initialize.Signature;
            }

            namespace Initialize {
                type Result = void;

                type Signature = () => Result;
            }

            interface PrivateContract {
                ports: Set<MessagePort>;

                broadcast: Broadcast.Signature;
                execute: Execute.Signature;
                reply: Reply.Signature;
            }

            namespace Broadcast {
                type Props = Worker.Response;

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Execute {
                type Props = Worker.Command;

                type Result = Promise<Worker.Payload>;

                type Signature = (props: Props) => Result;
            }

            namespace Reply {
                type Props = {
                    response: Worker.Response;
                    port: MessagePort;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }
        }

        namespace WorkerClient {
            type Authorization = {
                error?: string;
                url?: string;
            };

            type Pending = {
                timeout: ReturnType<typeof setTimeout>;

                resolve(payload: Worker.Payload): void;
                reject(error: Error): void;
            };

            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                invalidatePermissions: InvalidatePermissions.Signature;
                subscribePermissions: SubscribePermissions.Signature;
                retryAuthorization: RetryAuthorization.Signature;
                getSnapshot: GetSnapshot.Signature;
                initialize: Initialize.Signature;
                subscribe: Subscribe.Signature;
                authorize: Authorize.Signature;
                getToken: GetToken.Signature;
                logout: Logout.Signature;
            }

            namespace InvalidatePermissions {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace SubscribePermissions {
                type Props = {
                    listener: Listener;
                };

                type Result = Unsubscribe;

                type Signature = (props: Props) => Result;
            }

            namespace RetryAuthorization {
                type Result = void;

                type Signature = () => Result;
            }

            namespace GetSnapshot {
                type Result = Session.Snapshot;

                type Signature = () => Result;
            }

            namespace Initialize {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Subscribe {
                type Props = {
                    listener: Listener;
                };

                type Result = Unsubscribe;

                type Signature = (props: Props) => Result;
            }

            namespace Authorize {
                type Result = Promise<Authorization>;

                type Signature = () => Result;
            }

            namespace GetToken {
                type Props = Session.Manager.GetToken.Props;

                type Result = Session.Manager.GetToken.Result;

                type Signature = Session.Manager.GetToken.Signature;
            }

            namespace Logout {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            interface PrivateContract {
                authorization: Optional<Promise<Authorization>>;
                initialization: Optional<Promise<void>>;
                permissionListeners: Set<Listener>;
                worker: Nullable<SharedWorker>;
                pending: Map<string, Pending>;
                current: Session.Snapshot;
                listeners: Set<Listener>;
                initialized: boolean;

                initializeSession: InitializeSession.Signature;
                attachLifecycle: AttachLifecycle.Signature;
                synchronize: Synchronize.Signature;
                disconnect: Disconnect.Signature;
                publish: Publish.Signature;
                connect: Connect.Signature;
                receive: Receive.Signature;
                send: Send.Signature;
            }

            namespace InitializeSession {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace AttachLifecycle {
                type Result = void;

                type Signature = () => Result;
            }

            namespace Synchronize {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Disconnect {
                type Props = {
                    error: Error;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Receive {
                type Props = Worker.Response;

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Publish {
                type Props = Session.Snapshot;

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Connect {
                type Result = SharedWorker;

                type Signature = () => Result;
            }

            namespace Send {
                type Props = Worker.Command;

                type Result = Promise<Worker.Payload>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
