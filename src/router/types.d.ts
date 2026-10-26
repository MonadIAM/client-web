import type { ReactNode } from "react";

declare global {
    namespace Router {
        type Props = {
            initialization: Promise<void>;
        };

        type NotFoundProps = {
            rootPath: string;
        };

        namespace ErrorBoundary {
            type Props = {
                children: ReactNode;
                fallback: ReactNode;
            };

            type State = {
                failed: boolean;
            };
        }
    }
}
