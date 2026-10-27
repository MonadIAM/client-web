import type { BadgeTone } from "@monadiam/ui-kit/enums";
import type { ReactNode } from "react";

declare global {
    namespace ProfileDate {
        type Props = {
            value?: string;
        };
    }

    namespace ProfileLayout {
        type Props = {
            title: string;
            children: ReactNode;
        };
    }

    namespace ProfileDetails {
        type Props = {
            account: Auth.Account.Details;
        };

        type StatusTones = Record<Auth.Account.Details["status"], BadgeTone>;
    }
}
