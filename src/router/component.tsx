import { Navigate, useLocation, useRoutes } from "react-router";
import { Spinner } from "@monadiam/ui-kit";
import { JSX } from "react";

import { useSession } from "~auth";

import { privateRoutes } from "./private";
import { publicRoutes } from "./public";

export function Router(): JSX.Element {
    const session = useSession();
    const location = useLocation();
    const authenticated = session.status === "authenticated";
    const route = useRoutes(session.status === "initializing" ? [] : authenticated ? privateRoutes : publicRoutes);

    if (session.status === "initializing") {
        return <Spinner className="min-h-dvh" />;
    } else {
        return (
            route ?? (
                <Navigate
                    to={{ pathname: authenticated ? "/" : "/login", search: authenticated ? "" : location.search }}
                    replace
                />
            )
        );
    }
}
