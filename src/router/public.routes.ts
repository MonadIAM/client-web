import { RouteObject } from "react-router";
import { lazy } from "react";

import { LoadError } from "./components/load-error";

const Login = lazy(() =>
    import("~pages/login")
        .then((module) => ({ default: module.Login }))
        .catch((error: unknown) => {
            console.error(error);
            return { default: LoadError };
        }),
);

export const publicRoutes: RouteObject[] = [{ path: "/login", Component: Login }];
