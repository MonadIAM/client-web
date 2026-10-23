import { RouteObject } from "react-router";
import { lazy } from "react";

import { LoadError } from "./components/load-error";

const Login = lazy(() =>
    import("~pages/login").then((module) => ({ default: module.Login })).catch(() => ({ default: LoadError })),
);

export const publicRoutes: RouteObject[] = [{ path: "/login", Component: Login }];
