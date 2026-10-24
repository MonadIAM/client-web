import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { JSX, Suspense } from "react";

import { NotificationHost } from "~common/notifications/notification-host";
import { PermissionStore } from "~auth/permission";

import { PageErrorBoundary } from "./components/error-boundary";
import { RouteResolver } from "./components/router-content";
import { Loading } from "./components/loading";

export function Router({ initialization }: Router.Props): JSX.Element {
    return (
        <QueryClientProvider client={PermissionStore.client}>
            <NotificationHost />
            <BrowserRouter>
                <PageErrorBoundary>
                    <Suspense fallback={<Loading />}>
                        <RouteResolver initialization={initialization} />
                    </Suspense>
                </PageErrorBoundary>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
