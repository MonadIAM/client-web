import { ToastHost } from "@monadiam/ui-kit";
import { JSX, useEffect } from "react";

import { NotificationManager } from "./notification.manager";

export function NotificationHost(): JSX.Element {
    useEffect(() => {
        const onError = (event: ErrorEvent) => {
            NotificationManager.error({ cause: event.error ?? event.message });
            event.preventDefault();
        };
        const onRejection = (event: PromiseRejectionEvent) => {
            NotificationManager.error({ cause: event.reason });
            event.preventDefault();
        };

        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onRejection);

        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onRejection);
        };
    }, []);

    return <ToastHost source={NotificationManager} />;
}
