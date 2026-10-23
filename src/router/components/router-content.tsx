import { useRoutes } from "react-router";
import { JSX, use } from "react";

import { useSession } from "~auth";

import { privateRoutes } from "../private.routes";
import { publicRoutes } from "../public.routes";
import { NotFound } from "./not-found";
import { Loading } from "./loading";

export function RouteResolver({ initialization }: Router.Props): JSX.Element {
    use(initialization);
    const { status } = useSession();
    const route = useRoutes(status === "initializing" ? [] : status === "authenticated" ? privateRoutes : publicRoutes);
    const root = status === "authenticated" ? "/" : "/login";

    if (status === "initializing") {
        return <Loading />;
    } else if (route) {
        return route;
    } else {
        return <NotFound rootPath={root} />;
    }
}
