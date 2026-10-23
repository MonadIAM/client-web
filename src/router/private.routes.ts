import { RouteObject } from "react-router";
import { lazy } from "react";

import { LoadError } from "./components/load-error";

const Session = lazy(() =>
    import("~pages/session").then((module) => ({ default: module.Session })).catch(() => ({ default: LoadError })),
);

export const privateRoutes: RouteObject[] = [{ path: "/", Component: Session }];
