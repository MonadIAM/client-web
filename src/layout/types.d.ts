import { ReactNode } from "react";

declare global {
    namespace Layout {
        type Props = {
            children: ReactNode;
        };
    }
}
