import type { ThemeMode } from "@monadiam/ui-kit/enums";

declare global {
    namespace Theme {
        type Mode = ThemeMode;

        type Listener = () => void;

        type Unsubscribe = () => void;

        interface Contract extends PublicContract, PrivateContract {}

        interface PublicContract {
            getSnapshot: GetSnapshot.Signature;
            initialize: Initialize.Signature;
            subscribe: Subscribe.Signature;
            toggle: Toggle.Signature;
        }

        namespace Initialize {
            type Result = void;

            type Signature = () => Result;
        }

        namespace GetSnapshot {
            type Result = Mode;

            type Signature = () => Result;
        }

        namespace Subscribe {
            type Props = {
                listener: Listener;
            };

            type Result = Unsubscribe;

            type Signature = (props: Props) => Result;
        }

        namespace Toggle {
            type Result = void;

            type Signature = () => Result;
        }

        interface PrivateContract {
            readonly listeners: Set<Listener>;
            readonly system: MediaQueryList;
            readonly storageKey: string;

            preference: Optional<Mode>;
            initialized: boolean;
            current: Mode;

            readPreference: ReadPreference.Signature;
            synchronize: Synchronize.Signature;
            apply: Apply.Signature;
        }

        namespace ReadPreference {
            type Result = Optional<Mode>;

            type Signature = () => Result;
        }

        namespace Synchronize {
            type Result = void;

            type Signature = () => Result;
        }

        namespace Apply {
            type Props = {
                mode: Mode;
            };

            type Result = void;

            type Signature = (props: Props) => Result;
        }
    }
}
