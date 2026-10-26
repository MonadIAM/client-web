import type { OTPFlow } from "~src/enums";

declare global {
    namespace Auth.OTP.Cooldown {
        type Flow = OTPFlow;

        type Listener = () => void;

        type Unsubscribe = () => void;

        interface Contract extends PublicContract, PrivateContract {}

        interface PublicContract {
            readonly duration: number;
            readonly event: string;

            remaining: Remaining.Signature;
            start: Start.Signature;
            recover: Recover.Signature;
        }

        namespace Remaining {
            type Props = {
                flow: Flow;
            };

            type Result = number;

            type Signature = (props: Props) => Result;
        }

        namespace Start {
            type Props = {
                delay?: number;
                flow: Flow;
            };

            type Result = void;

            type Signature = (props: Props) => Result;
        }

        namespace Recover {
            type Props = {
                cause: unknown;
                flow: Flow;
            };

            type Result = void;

            type Signature = (props: Props) => Result;
        }

        interface PrivateContract {
            readonly deadlines: Map<Flow, number>;
        }

        namespace Use {
            type Props = Remaining.Props;

            type Result = Remaining.Result;

            type Signature = (props: Props) => Result;
        }
    }
}
