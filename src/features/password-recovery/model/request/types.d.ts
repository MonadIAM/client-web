declare namespace PasswordRecovery.Request {
    type Props = {
        identifier: string;

        onContinue(identifier: string, method: PasswordRecovery.Method): void;
    };
}
