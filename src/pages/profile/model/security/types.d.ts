import type { z } from "zod";

import type { useSecurityConfirmationForm } from "./use-security-confirmation.form";
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

                onComplete?: Complete.Signature;
                action: Submit.Signature;
            };

            type AuthenticationProps = Pick<Props, "title" | "subject" | "description" | "mutationKey" | "method"> & {
                onComplete(): void | Promise<void>;
            };

            type ConfirmationProps = Props & Pick<ReturnType<typeof useSecurityConfirmationForm>, "form" | "pending">;

            type MethodOption = {
                value: SecurityAuthentication;
                label: string;
            };

            type FieldsProps = AuthenticationProps & {
                methods: MethodOption[];
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
                requiresReauthentication: RequiresReauthentication.Signature;
                authenticate: Authenticate.Signature;
                requestCode: RequestCode.Signature;
                status: Status.Signature;
            }

            namespace RequiresReauthentication {
                type Props = {
                    cause: unknown;
                };

                type Result = boolean;

                type Signature = (props: Props) => Result;
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
