declare namespace Signup {
    namespace SaveRecoveryCodes {
        type Props = {
            codes: string[];

            onComplete(): void;
        };
    }

    namespace Registration {
        type Props = {
            onIdentifierChange(identifier: string): void;
            onCreated(identifier: string): void;
        };
    }

    namespace Verification {
        type Props = {
            identifier: string;

            onVerified(codes: string[]): void;
        };
    }
}
