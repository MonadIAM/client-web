import { z } from "zod";

import { WorkerSchema } from "../worker.schema";
import { OAuthSchema } from "../oauth.schema";

declare global {
    namespace Auth.Session {
        type Transaction = z.infer<typeof OAuthSchema.transaction>;
        type Credential = z.infer<typeof OAuthSchema.credential>;
        type Snapshot = z.infer<typeof OAuthSchema.snapshot>;
        type Claims = z.infer<typeof OAuthSchema.claims>;
        type Stored = z.infer<typeof OAuthSchema.stored>;

        namespace Manager {
            interface Contract extends PublicContract, PrivateContract {}

            namespace StartAuthorization {
                type Result = OAuth.Authorize.Result;

                type Signature = () => Result;
            }

            namespace SnapshotAction {
                type Result = Snapshot;

                type Signature = () => Result;
            }

            interface PublicContract {
                authorize: StartAuthorization.Signature;
                snapshot: SnapshotAction.Signature;
                subscribe: Subscribe.Signature;
                callback: Callback.Signature;
                getToken: GetToken.Signature;
                restore: Restore.Signature;
                logout: Logout.Signature;
            }

            namespace Subscribe {
                type Props = {
                    listener: Listener;
                };

                type Result = Unsubscribe;

                type Signature = (props: Props) => Result;
            }

            namespace GetToken {
                type Props = z.infer<typeof WorkerSchema.tokenProps>;

                type Result = Promise<Credential>;

                type Signature = (props: Props) => Result;
            }

            namespace Callback {
                type Props = {
                    address: string;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Restore {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Logout {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            interface PrivateContract {
                authorization: Optional<OAuth.Authorize.Result>;
                callbacks: Map<string, Promise<void>>;
                refresh: Optional<Refresh.Result>;
                loading: Optional<Promise<void>>;
                storageError: Optional<string>;
                listeners: Set<Listener>;
                writes: Promise<void>;
                stored: Stored;

                prepareAuthorization: PrepareAuthorization.Signature;
                completeCallback: CompleteCallback.Signature;
                refreshSession: Refresh.Signature;
                commit: Commit.Signature;
                load: Load.Signature;
            }

            namespace PrepareAuthorization {
                type Result = OAuth.Authorize.Result;

                type Signature = () => Result;
            }

            namespace CompleteCallback {
                type Props = {
                    state: string;
                    url: URL;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Refresh {
                type Props = {
                    previous: Stored;
                    identity: OAuth.Identity;
                };

                type Result = Promise<Credential>;

                type Signature = (props: Props) => Result;
            }

            namespace Commit {
                type Props = Stored;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Load {
                type Result = Promise<void>;

                type Signature = () => Result;
            }
        }

        namespace Repository {
            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                deleteTransaction: DeleteTransaction.Signature;
                writeTransaction: WriteTransaction.Signature;
                readTransaction: ReadTransaction.Signature;
                writeSession: WriteSession.Signature;
                readSession: ReadSession.Signature;
            }

            namespace DeleteTransaction {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace WriteTransaction {
                type Props = {
                    value: Transaction;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace ReadTransaction {
                type Result = Promise<Optional<Transaction>>;

                type Signature = () => Result;
            }

            namespace WriteSession {
                type Props = {
                    value: Stored;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace ReadSession {
                type Result = Promise<Optional<Stored>>;

                type Signature = () => Result;
            }

            interface PrivateContract {
                database: Optional<Promise<IDBDatabase>>;
                key: string;

                write: Write.Signature;
                open: Open.Signature;
                read: Read.Signature;
            }

            namespace Write {
                type Props = {
                    value: Stored | Transaction;
                    key: string;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Open {
                type Result = Promise<IDBDatabase>;

                type Signature = () => Result;
            }

            namespace Read {
                type Props<T> = {
                    schema: z.ZodType<T>;
                    key: string;
                };

                type Result<T> = Promise<T>;

                type Signature = <T>(props: Props<T>) => Result<T>;
            }
        }
    }
}
