import type { SigninOTPStep } from "~src/enums";

declare global {
    namespace SigninOTP {
        type State = {
            step: SigninOTPStep;
            identifier: string;
        };

        namespace Request {
            type Props = {
                authorizationRequest: Nullable<string>;
                identifier: string;

                onContinue(identifier: string): void;
            };
        }

        namespace Verify {
            type Props = {
                authorizationRequest: Nullable<string>;

                onBack(): void;
            };
        }
    }
}
