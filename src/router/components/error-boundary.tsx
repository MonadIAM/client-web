import { Component, ReactNode } from "react";

import { LoadError } from "./load-error";

export class PageErrorBoundary extends Component<Router.PageErrorBoundary.Props, Router.PageErrorBoundary.State> {
    public override state: Router.PageErrorBoundary.State = { failed: false };

    public static getDerivedStateFromError(): Router.PageErrorBoundary.State {
        return { failed: true };
    }

    public override render(): ReactNode {
        return this.state.failed ? <LoadError /> : this.props.children;
    }
}
