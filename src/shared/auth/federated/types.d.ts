import { z } from "zod";

import { FederatedSchema } from "./federated.schema";

declare global {
    namespace Auth.Federated {
        type Provider = z.infer<typeof FederatedSchema.provider>;

        type Result = z.infer<typeof FederatedSchema.result>;

        interface Contract extends PublicContract, PrivateContract {}

        interface PublicContract {
            authorize: Authorize.Signature;
            complete: Complete.Signature;
        }

        interface PrivateContract {
            completion: Optional<Complete.Result>;
            storageKey: string;

            exchange: Complete.Signature;
        }

        namespace Authorize {
            type Props = {
                authorizationRequest: string;
                provider: Provider;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        namespace Complete {
            type Props = {
                address: string;
            };

            type Result = Promise<Auth.Federated.Result>;

            type Signature = (props: Props) => Result;
        }
    }
}
