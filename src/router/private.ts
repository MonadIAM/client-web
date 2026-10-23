import { RouteObject } from "react-router";

import { Session } from "~pages/session";

export const privateRoutes: RouteObject[] = [{ path: "/", Component: Session }];
