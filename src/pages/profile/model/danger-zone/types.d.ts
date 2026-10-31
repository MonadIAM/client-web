import type { PasswordResetMethod } from "./enums";

declare global {
    namespace AccountDangerZone {
        namespace Complete {
            type Signature = () => void;
        }

        namespace Manager {
            interface PublicContract {
                requestPasswordReset: RequestPasswordReset.Signature;
                regenerateCodes: RegenerateCodes.Signature;
                changePassword: ChangePassword.Signature;
                resetPassword: ResetPassword.Signature;
                setPassword: SetPassword.Signature;
                deactivate: Deactivate.Signature;
            }

            namespace RequestPasswordReset {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace ResetPassword {
                type Props = API.Identity.PasswordResetCurrentByOTPBody & {
                    method: PasswordResetMethod;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace SetPassword {
                type Props = API.Identity.PasswordSetBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace ChangePassword {
                type Props = API.Identity.PasswordChangeBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace RegenerateCodes {
                type Result = Promise<string[]>;

                type Signature = () => Result;
            }

            namespace Deactivate {
                type Result = Promise<void>;

                type Signature = () => Result;
            }
        }

        namespace PasswordReset {
            type Props = {
                onComplete: Complete.Signature;
            };

            type Values = Password.Values & {
                method: PasswordResetMethod;
                code: string;
            };
        }

        namespace Password {
            type Props = {
                hasPassword: boolean;

                onComplete: Complete.Signature;
            };

            type Values = {
                confirmation: string;
                password: string;
            };
        }
    }
}
