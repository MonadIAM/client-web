import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<Router.ErrorBoundary.Props, Router.ErrorBoundary.State> {
    public override state: Router.ErrorBoundary.State = { failed: false };

    public static getDerivedStateFromError(): Router.ErrorBoundary.State {
        return { failed: true };
    }

    public override render(): ReactNode {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
