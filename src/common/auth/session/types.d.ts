import { z } from "zod";

import { WorkerSchema } from "../worker.schema";
import { OAuthSchema } from "../oauth.schema";

declare global {
    namespace Auth.Session {
        type Claims = z.infer<typeof OAuthSchema.claims>;

        type Stored = z.infer<typeof OAuthSchema.stored>;

        type Transaction = z.infer<typeof OAuthSchema.transaction>;

        type Snapshot = z.infer<typeof OAuthSchema.snapshot>;

        type Credential = z.infer<typeof OAuthSchema.credential>;

        namespace GetToken {
            type Props = z.infer<typeof WorkerSchema.tokenProps>;

            type Result = Promise<Credential>;
        }

        namespace Callback {
            type Props = {
                address: string;
            };

            type Result = Promise<void>;
        }

        namespace CompleteCallback {
            type Props = {
                url: URL;
                state: string;
            };

            type Result = Promise<void>;
        }

        namespace Refresh {
            type Props = {
                previous: Stored;
                identity: OAuth.Identity;
            };

            type Result = Promise<Credential>;
        }

        namespace Storage {
            namespace Read {
                type Props<T> = {
                    key: string;
                    schema: z.ZodType<T>;
                };

                type Result<T> = Promise<T>;
            }

            namespace Write {
                type Props = {
                    key: string;
                    value: Stored | Transaction;
                };

                type Result = Promise<void>;
            }
        }
    }
}
