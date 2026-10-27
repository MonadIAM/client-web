import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { AuthWorkerClient, permissionQueryKey } from "~shared/auth";
import { queryClient } from "~app/providers/query";
import { ThemeManager } from "~shared/theme";
import { localization } from "~shared/i18n";
import { Router } from "~app/router";
import { API } from "~shared/api";

import "~app/styles/index.css";

ThemeManager.initialize();
await localization;

const rootElement = document.getElementById("root");

if (rootElement) {
    API.initialize();
    let initialized = false;

    if (!initialized) {
        initialized = true;
        let revision = "";

        AuthWorkerClient.subscribe({
            listener: () => {
                const session = AuthWorkerClient.getSnapshot();
                if (session.revision !== revision) {
                    revision = session.revision;
                    queryClient.clear();
                }
            },
        });

        AuthWorkerClient.subscribePermissions({
            listener: () => {
                void queryClient.invalidateQueries({ queryKey: permissionQueryKey });
            },
        });
    }

    const initialization = AuthWorkerClient.initialize();
    const root = createRoot(rootElement, {
        onCaughtError: (error) => console.error(error),
    });
    root.render(
        <StrictMode>
            <Router initialization={initialization} />
        </StrictMode>,
    );
} else {
    throw new Error("Root element #root was not found");
}
