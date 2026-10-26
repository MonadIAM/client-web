import { Component, ReactNode } from "react";
import { useLocation } from "react-router";

import { LoadError } from "./load-error";

class Boundary extends Component<Router.PageErrorBoundary.Props, Router.PageErrorBoundary.State> {
    public override state: Router.PageErrorBoundary.State = { failed: false };

    public static getDerivedStateFromError(): Router.PageErrorBoundary.State {
        return { failed: true };
    }

    public override render(): ReactNode {
        return this.state.failed ? <LoadError /> : this.props.children;
    }
}

export function PageErrorBoundary({ children }: Router.PageErrorBoundary.Props): ReactNode {
    const { pathname } = useLocation();
    return <Boundary key={pathname}>{children}</Boundary>;
}
