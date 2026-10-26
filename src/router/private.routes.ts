import { RouteObject } from "react-router";
import { lazy } from "react";

const Profile = lazy(() => import("~pages/profile").then((module) => ({ default: module.Profile })));

const Main = lazy(() => import("~pages/main").then((module) => ({ default: module.Main })));

export const privateRoutes: RouteObject[] = [
    { path: "/", Component: Main },
    { path: "/profile", Component: Profile },
];
