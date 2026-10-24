export {};

declare global {
    namespace Notifications {
        type Options = UI.Toast.Options;
        type Transport = UI.Toast.Transport;
        type Unsubscribe = () => void;

        namespace Queue {
            type Entry = {
                options: Options & { id: string };
                closing: boolean;
            };

            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                readonly limit: number;

                connect: Connect.Signature;
                update: Update.Signature;
                close: Close.Signature;
                add: Add.Signature;
            }

            namespace Connect {
                type Props = {
                    transport: Transport;
                };

                type Result = Unsubscribe;

                type Signature = (props: Props) => Result;
            }

            namespace Update {
                type Props = {
                    options: Partial<Options>;
                    id: string;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Close {
                type Props = {
                    id?: string;
                };

                type Result = void;

                type Signature = (props?: Props) => Result;
            }

            namespace Add {
                type Props = Options;

                type Result = string;

                type Signature = (props: Props) => Result;
            }

            interface PrivateContract {
                waiting: Map<string, Entry>;
                visible: Map<string, Entry>;
                transport: Optional<Transport>;

                present: Present.Signature;
                drain: Drain.Signature;
            }

            namespace Present {
                type Props = {
                    transport: Transport;
                    entry: Entry;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }

            namespace Drain {
                type Result = void;

                type Signature = () => Result;
            }
        }

        namespace Manager {
            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                readonly limit: number;

                connect: Connect.Signature;
                success: Success.Signature;
                warning: Warning.Signature;
                update: Update.Signature;
                close: Close.Signature;
                error: Error.Signature;
                info: Info.Signature;
            }

            namespace Connect {
                type Props = Queue.Connect.Props;

                type Result = Queue.Connect.Result;

                type Signature = (props: Props) => Result;
            }

            namespace Success {
                type Props = Omit<Options, "type">;

                type Result = Queue.Add.Result;

                type Signature = (props: Props) => Result;
            }

            namespace Info {
                type Props = Omit<Options, "type">;

                type Result = Queue.Add.Result;

                type Signature = (props: Props) => Result;
            }

            namespace Warning {
                type Props = Omit<Options, "type">;

                type Result = Queue.Add.Result;

                type Signature = (props: Props) => Result;
            }

            namespace Error {
                type Props = Omit<Options, "type" | "title"> & { cause: unknown; title?: string; logged?: boolean };

                type Result = Optional<string>;

                type Signature = (props: Props) => Result;
            }

            namespace Update {
                type Props = Queue.Update.Props;

                type Result = Queue.Update.Result;

                type Signature = (props: Props) => Result;
            }

            namespace Close {
                type Props = Queue.Close.Props;

                type Result = Queue.Close.Result;

                type Signature = (props?: Props) => Result;
            }

            interface PrivateContract {
                reported: WeakMap<object, string>;

                getMessage: GetMessage.Signature;
                log: Log.Signature;
            }

            namespace GetMessage {
                type Props = {
                    cause: unknown;
                };

                type Result = string;

                type Signature = (props: Props) => Result;
            }

            namespace Log {
                type Props = {
                    cause: unknown;
                };

                type Result = void;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
