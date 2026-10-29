import { RouteObject } from "react-router";
import { lazy } from "react";

const Notifications = lazy(() => import("~pages/profile").then((module) => ({ default: module.Notifications })));
const Security = lazy(() => import("~pages/profile").then((module) => ({ default: module.Security })));
const Sessions = lazy(() => import("~pages/profile").then((module) => ({ default: module.Sessions })));
const Profile = lazy(() => import("~pages/profile").then((module) => ({ default: module.Profile })));
const Main = lazy(() => import("~pages/main").then((module) => ({ default: module.Main })));

export const privateRoutes: RouteObject[] = [
    { path: "/profile/notifications", Component: Notifications },
    { path: "/profile/security", Component: Security },
    { path: "/profile/sessions", Component: Sessions },
    { path: "/profile", Component: Profile },
    { path: "/", Component: Main },
];
