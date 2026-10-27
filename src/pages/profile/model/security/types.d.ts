import type { SecurityAuthentication } from "./enums";

declare global {
    namespace Security {
        namespace Remove {
            type Values = {
                method: SecurityAuthentication;
                password: string;
                code: string;
            };

            type Props = {
                title: string;
                subject: string;
                description: string;
                successMessage: string;
                mutationKey: string[];

                onRemoved: Complete.Signature;
                remove: Submit.Signature;
            };

            namespace Submit {
                type Signature = () => Promise<void>;
            }

            namespace Complete {
                type Signature = () => void;
            }
        }

        namespace Manager {
            interface PublicContract {
                authenticate: Authenticate.Signature;
            }

            namespace Authenticate {
                type Props = Remove.Values;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
