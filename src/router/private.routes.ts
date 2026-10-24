import { RouteObject } from "react-router";
import { lazy } from "react";

import { LoadError } from "./components/load-error";

const Session = lazy(() =>
    import("~pages/session")
        .then((module) => ({ default: module.Session }))
        .catch((error: unknown) => {
            console.error(error);
            return { default: LoadError };
        }),
);

export const privateRoutes: RouteObject[] = [{ path: "/", Component: Session }];
