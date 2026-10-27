import type { z } from "zod";

import type { IdentifierType } from "~shared/api/generated/identity";

import type { IdentifierSchema } from "./schema";
import type { IdentifierDialogMode } from "./enums";

declare global {
    namespace Identifiers {
        type Identifier = z.infer<typeof IdentifierSchema.identifier>;

        namespace Complete {
            type Signature = () => void;
        }

        namespace Created {
            type Signature = (identifier: string) => void;
        }

        namespace ChangeDialog {
            type Signature = (state: DialogState) => void;
        }

        type Draft = {
            type: IdentifierType.EMAIL | IdentifierType.PHONE;
            identifier: string;
        };

        type DialogState =
            | {
                  mode: IdentifierDialogMode.ADD;
              }
            | {
                  mode: IdentifierDialogMode.VERIFY;
                  identity: string;
              }
            | {
                  mode: IdentifierDialogMode.REMOVE;
                  identity: string;
                  id: string;
              };

        namespace Create {
            type Props = {
                onCreated: Created.Signature;
            };
        }

        namespace Verify {
            type Props = {
                identity: string;

                onVerified: Complete.Signature;
            };
        }

        namespace Remove {
            type Props = {
                id: string;
                identity: string;

                onRemoved: Complete.Signature;
            };
        }

        namespace Manager {
            interface Contract extends PublicContract, PrivateContract {}

            interface PrivateContract {
                load: Load.Signature;
            }

            interface PublicContract {
                list: List.Signature;
                create: Create.Signature;
                verify: Verify.Signature;
                resend: Resend.Signature;
                toggle: Toggle.Signature;
                remove: Remove.Signature;
            }

            namespace List {
                type Props = {
                    signal: AbortSignal;
                };

                type Result = Promise<Identifier[]>;

                type Signature = (props: Props) => Result;
            }

            namespace Load {
                type Props = {
                    signal: AbortSignal;
                    currentPage: number;
                };

                type Result = Promise<Identifier[]>;

                type Signature = (props: Props) => Result;
            }

            namespace Create {
                type Props = Draft;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Verify {
                type Props = API.Identity.IdentifierVerifyBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Resend {
                type Props = API.Identity.IdentifierResendVerificationBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Toggle {
                type Props = API.Identity.IdentifierTogglePublicContactBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace Remove {
                type Props = {
                    identifier: string;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
