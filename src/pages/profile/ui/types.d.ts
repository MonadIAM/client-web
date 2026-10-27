import type { ReactNode } from "react";
import type { BadgeTone } from "@monadiam/ui-kit/enums";

declare global {
    namespace ProfileLayout {
        type Props = {
            title: string;
            description: string;
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
