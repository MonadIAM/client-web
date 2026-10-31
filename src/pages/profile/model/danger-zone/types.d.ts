declare namespace AccountDangerZone {
    namespace Complete {
        type Signature = () => void;
    }

    namespace Manager {
        interface PublicContract {
            regenerateCodes: RegenerateCodes.Signature;
            changePassword: ChangePassword.Signature;
            setPassword: SetPassword.Signature;
            deactivate: Deactivate.Signature;
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

    namespace Password {
        type Props = {
            hasPassword: boolean;

            onComplete: Complete.Signature;
        };

        type Values = {
            currentPassword: string;
            confirmation: string;
            password: string;
        };
    }
}
