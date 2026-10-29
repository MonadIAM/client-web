import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { JSX, Suspense } from "react";

import { queryClient } from "~app/providers/query";

import { ErrorBoundary } from "./components/error-boundary";
import { RouteResolver } from "./components/router-content";
import { LoadError } from "./components/load-error";
import { Loading } from "./components/loading";

export function Router({ initialization }: Router.Props): JSX.Element {
    return (
        <ErrorBoundary fallback={<LoadError />}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Suspense fallback={<Loading />}>
                        <RouteResolver initialization={initialization} />
                    </Suspense>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
