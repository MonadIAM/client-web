declare namespace Notifications {
    namespace Sound {
        namespace Use {
            type Result = {
                play: Play.Signature;
                playing: boolean;
                ready: boolean;
            };

            type Signature = () => Result;
        }

        namespace Play {
            type Props = {
                automatic?: boolean;
            };

            type Result = Promise<boolean>;

            type Signature = (props?: Props) => Result;
        }

        namespace Prepare {
            type Result = AudioContext;

            type Signature = () => Result;
        }
    }
}
