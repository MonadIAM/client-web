import type { ReactNode } from "react";

declare global {
    namespace Router {
        type Props = {
            initialization: Promise<void>;
        };

        type NotFoundProps = {
            rootPath: string;
        };

        namespace PageErrorBoundary {
            type Props = {
                children: ReactNode;
            };

            type State = {
                failed: boolean;
            };
        }
    }
}
