import type { RefObject } from "react";

declare global {
    namespace Appearance {
        type Props = {
            returnFocus: RefObject<Nullable<HTMLElement>>;
            open: boolean;

            onOpenChange(open: boolean): void;
        };
    }
}
