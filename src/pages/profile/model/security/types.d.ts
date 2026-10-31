import type { z } from "zod";

import type { SecurityAuthentication } from "./enums";
import type { SecuritySchema } from "./schema";

declare global {
    namespace Security {
        type Status = z.infer<typeof SecuritySchema.status>;

        namespace Action {
            type Values = {
                method: SecurityAuthentication;
                password: string;
                code: string;
            };

            type Props = {
                title: string;
                subject: string;
                description: string;
                successMessage?: string;
                mutationKey: string[];
                method?: SecurityAuthentication;

                onComplete: Complete.Signature;
            } & (Confirmation | Operation);

            type Confirmation = {
                authenticateOnly: true;
                action?: never;
            };

            type Operation = {
                authenticateOnly?: false;
                reauthenticate?: boolean;

                action: Submit.Signature;
            };

            type MethodOption = {
                value: SecurityAuthentication;
                label: string;
            };

            type FieldsProps = Props & {
                security: Status;
            };

            namespace SendCode {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Submit {
                type Signature = () => Promise<void>;
            }

            namespace Complete {
                type Signature = () => void;
            }
        }

        namespace Manager {
            interface PublicContract {
                status: Status.Signature;
                requestCode: RequestCode.Signature;
                authenticate: Authenticate.Signature;
            }

            namespace Status {
                type Props = {
                    signal: AbortSignal;
                };

                type Result = Promise<Security.Status>;

                type Signature = (props: Props) => Result;
            }

            namespace RequestCode {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace Authenticate {
                type Props = Action.Values;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
