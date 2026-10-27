declare namespace PasswordRecovery.Reset {
    type Props = {
        method: PasswordRecovery.Method;
        identifier: string;

        onBack(identifier: string): void;
        onComplete(): void;
    };
}
