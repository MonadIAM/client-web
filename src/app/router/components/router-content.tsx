import { useRoutes } from "react-router";
import { JSX, use } from "react";

import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { privateRoutes } from "../private.routes";
import { publicRoutes } from "../public.routes";
import { NotFound } from "./not-found";
import { Loading } from "./loading";

export function RouteResolver({ initialization }: Router.Props): JSX.Element {
    use(initialization);
    const { status } = useSession();
    const route = useRoutes(
        status === SessionStatus.INITIALIZING ? [] : status === SessionStatus.AUTHENTICATED ? privateRoutes : publicRoutes,
    );

    if (status === SessionStatus.INITIALIZING) {
        return <Loading />;
    } else if (route) {
        return route;
    } else {
        return <NotFound rootPath={status === SessionStatus.AUTHENTICATED ? "/" : "/signin"} />;
    }
}
