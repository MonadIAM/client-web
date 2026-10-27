import { RouteObject } from "react-router";
import { lazy } from "react";

const SecondFactor = lazy(() => import("~pages/second-factor").then((module) => ({ default: module.SecondFactor })));
const SigninOTP = lazy(() => import("~pages/signin-otp").then((module) => ({ default: module.SigninOTP })));
const SignIn = lazy(() => import("~pages/signin").then((module) => ({ default: module.SignIn })));
const SignUp = lazy(() => import("~pages/signup").then((module) => ({ default: module.SignUp })));
const ResetSecondFactor = lazy(() =>
    import("~pages/reset-second-factor").then((module) => ({ default: module.ResetSecondFactor })),
);
const FederatedCallback = lazy(() =>
    import("~pages/federated-callback").then((module) => ({ default: module.FederatedCallback })),
);
const PasswordRecovery = lazy(() =>
    import("~pages/password-recovery").then((module) => ({ default: module.PasswordRecovery })),
);

export const publicRoutes: RouteObject[] = [
    { path: "/signin/second-factor/reset", Component: ResetSecondFactor },
    { path: "/auth/federated/callback", Component: FederatedCallback },
    { path: "/password-recovery", Component: PasswordRecovery },
    { path: "/signin/second-factor", Component: SecondFactor },
    { path: "/signin/otp", Component: SigninOTP },
    { path: "/signin", Component: SignIn },
    { path: "/signup", Component: SignUp },
];
