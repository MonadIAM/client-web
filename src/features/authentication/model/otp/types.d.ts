import type { SigninOTPStep, SigninOTPAction } from "./enums";

declare global {
    namespace SigninOTP {
        type Action = { type: SigninOTPAction.VERIFY; identifier: string } | { type: SigninOTPAction.BACK };

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
