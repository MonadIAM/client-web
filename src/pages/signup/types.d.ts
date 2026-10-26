import type { SignupStep } from "~src/enums";

declare global {
    namespace Signup {
        type State =
            | {
                  step: SignupStep.REGISTRATION;
                  identifier: string;
              }
            | {
                  step: SignupStep.VERIFICATION;
                  identifier: string;
              }
            | {
                  step: SignupStep.RECOVERY;
                  codes: string[];
              };

        namespace SaveRecoveryCodes {
            type Props = {
                codes: string[];

                onComplete(): void;
            };
        }

        namespace Registration {
            type Props = {
                identifier: string;

                onContinue(identifier: string): void;
            };
        }

        namespace Verification {
            type Props = {
                identifier: string;

                onVerified(codes: string[]): void;
            };
        }
    }
}
