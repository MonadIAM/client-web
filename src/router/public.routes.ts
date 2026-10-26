import { RouteObject } from "react-router";
import { lazy } from "react";

const SignIn = lazy(() => import("~pages/signin").then((module) => ({ default: module.SignIn })));
const SignUp = lazy(() => import("~pages/signup").then((module) => ({ default: module.SignUp })));

const PasswordRecovery = lazy(() =>
    import("~pages/password-recovery").then((module) => ({ default: module.PasswordRecovery })),
);

const FederatedCallback = lazy(() =>
    import("~pages/federated-callback").then((module) => ({ default: module.FederatedCallback })),
);

const SigninOTP = lazy(() => import("~pages/signin-otp").then((module) => ({ default: module.SigninOTP })));

const SecondFactor = lazy(() => import("~pages/second-factor").then((module) => ({ default: module.SecondFactor })));

const ResetSecondFactor = lazy(() =>
    import("~pages/reset-second-factor").then((module) => ({ default: module.ResetSecondFactor })),
);

export const publicRoutes: RouteObject[] = [
    { path: "/signin", Component: SignIn },
    { path: "/signin/otp", Component: SigninOTP },
    { path: "/signin/second-factor", Component: SecondFactor },
    { path: "/signin/second-factor/reset", Component: ResetSecondFactor },
    { path: "/auth/federated/callback", Component: FederatedCallback },
    { path: "/signup", Component: SignUp },
    { path: "/password-recovery", Component: PasswordRecovery },
];
