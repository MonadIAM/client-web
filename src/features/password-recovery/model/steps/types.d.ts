import type { PasswordRecoveryStep, PasswordRecoveryAction } from "./enums";

declare global {
    namespace PasswordRecovery {
        type Action =
            | { type: PasswordRecoveryAction.PROCEED; identifier: string; method: Method }
            | { type: PasswordRecoveryAction.BACK; identifier: string }
            | { type: PasswordRecoveryAction.COMPLETE };

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
    }
}
