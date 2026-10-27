import type { z } from "zod";

import type { SessionsSchema } from "./schema";
import type { SessionRevokeMode } from "./enums";

declare global {
    namespace Sessions {
        type Session = z.infer<typeof SessionsSchema.session>;

        namespace Manager {
            interface PublicContract {
                list: List.Signature;
                revoke: Revoke.Signature;
                revokeAll: RevokeAll.Signature;
            }

            namespace List {
                type Props = {
                    signal: AbortSignal;
                    currentId: string;
                };

                type Result = Promise<Session[]>;

                type Signature = (props: Props) => Result;
            }

            namespace Revoke {
                type Props = z.infer<typeof SessionsSchema.revoke>;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace RevokeAll {
                type Result = Promise<void>;

                type Signature = () => Result;
            }
        }

        namespace Revoke {
            type Target =
                | {
                      mode: SessionRevokeMode.ALL;
                  }
                | {
                      mode: SessionRevokeMode.SINGLE;
                      session: Session;
                  };

            type Props = {
                onRevoked: Complete.Signature;
            };
        }

        namespace Complete {
            type Signature = () => void;
        }
    }
}
