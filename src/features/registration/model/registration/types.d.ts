declare namespace Signup.Registration {
    type Props = {
        identifier: string;

        onContinue(identifier: string): void;
    };
}
