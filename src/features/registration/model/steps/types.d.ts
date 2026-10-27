import type { SignupStep, SignupAction } from "./enums";

declare global {
    namespace Signup {
        type Action =
            | { type: SignupAction.VERIFY; identifier: string }
            | { type: SignupAction.BACK; identifier: string }
            | { type: SignupAction.COMPLETE; codes: string[] };

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
    }
}
