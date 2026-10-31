import type { DangerZoneAction } from "../../model/danger-zone/enums";

declare global {
    namespace ProfileDangerZone {
        type Props = {
            disabled: boolean;
        };
    }

    namespace AccountDangerZone {
        namespace Dialog {
            type Props = {
                action: DangerZoneAction;
                hasPassword: boolean;

                onClose: Complete.Signature;
            };
        }

        namespace Codes {
            type Props = {
                codes: string[];

                onComplete: Complete.Signature;
            };
        }
    }
}
