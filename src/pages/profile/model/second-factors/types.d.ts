import type { z } from "zod";

import type { SecondFactorSchema } from "./schema";
import type { SecondFactorDialogMode } from "./enums";

declare global {
    namespace SecondFactors {
        type Factor = z.infer<typeof SecondFactorSchema.factor>;

        type Setup = z.infer<typeof SecondFactorSchema.setup>;

        type Verification = z.infer<typeof SecondFactorSchema.verification>;

        type DialogState = {
            mode: SecondFactorDialogMode;
            factor?: Factor;
            setup?: Setup;
        };

        namespace Complete {
            type Signature = () => void;
        }

        namespace Created {
            type Signature = (setup: Setup) => void;
        }

        namespace Verified {
            type Signature = (result: Verification) => void;
        }

        namespace Change {
            type Signature = (state: DialogState) => void;
        }

        namespace Create {
            type Props = {
                onCreated: Created.Signature;
            };
        }

        namespace Verify {
            type Props = {
                setup: Setup;

                onVerified: Verified.Signature;
            };
        }

        namespace Manager {
            interface PublicContract {
                list: List.Signature;
                create: Create.Signature;
                setup: Setup.Signature;
                verify: Verify.Signature;
                remove: Remove.Signature;
                secret: Secret.Signature;
            }

            namespace List {
                type Props = {
                    signal: AbortSignal;
                };

                type Result = Promise<Factor[]>;

                type Signature = (props: Props) => Result;
            }

            namespace Create {
                type Props = API.Identity.SecondFactorCreateBody;

                type Result = Promise<SecondFactors.Setup>;

                type Signature = (props: Props) => Result;
            }

            namespace Setup {
                type Props = {
                    id: string;
                    signal: AbortSignal;
                };

                type Result = Promise<SecondFactors.Setup>;

                type Signature = (props: Props) => Result;
            }

            namespace Verify {
                type Props = API.Identity.SecondFactorVerifyBody;

                type Result = Promise<Verification>;

                type Signature = (props: Props) => Result;
            }

            namespace Remove {
                type Props = {
                    factor: string;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Secret {
                type Props = {
                    uri: string;
                };

                type Result = string;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
