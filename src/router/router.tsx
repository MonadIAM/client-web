import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { JSX, Suspense } from "react";

import { PermissionStore } from "~auth";
import { Layout } from "~layout";

import { PageErrorBoundary } from "./components/error-boundary";
import { RouteResolver } from "./components/router-content";
import { Loading } from "./components/loading";

export function Router({ initialization }: Router.Props): JSX.Element {
    return (
        <QueryClientProvider client={PermissionStore.client}>
            <BrowserRouter>
                <Layout>
                    <PageErrorBoundary>
                        <Suspense fallback={<Loading />}>
                            <RouteResolver initialization={initialization} />
                        </Suspense>
                    </PageErrorBoundary>
                </Layout>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
