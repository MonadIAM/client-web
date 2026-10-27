declare namespace Signup.Verification {
    type Props = {
        identifier: string;

        onVerified(codes: string[]): void;
    };
}
