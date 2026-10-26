import type { PasswordRecoveryStep } from "~src/enums";

declare global {
    namespace PasswordRecovery {
        type Method = Exclude<PasswordRecoveryStep, PasswordRecoveryStep.REQUEST | PasswordRecoveryStep.COMPLETE>;

        type State =
            | {
                  step: PasswordRecoveryStep.REQUEST;
                  identifier: string;
              }
            | {
                  step: Method;
                  identifier: string;
              }
            | {
                  step: PasswordRecoveryStep.COMPLETE;
              };

        namespace Request {
            type Props = {
                identifier: string;

                onContinue(identifier: string, method: Method): void;
            };
        }

        namespace Reset {
            type Props = {
                method: Method;
                identifier: string;

                onBack(identifier: string): void;
                onComplete(): void;
            };
        }
    }
}
