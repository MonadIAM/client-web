import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { ThemeManager } from "~common/theme/theme.manager";
import { PermissionStore, AuthWorkerClient } from "~auth";
import { localization } from "~common/i18n";
import { Router } from "~router";
import { API } from "~api";

import "~assets/styles/index.css";

ThemeManager.initialize();
await localization;

const rootElement = document.getElementById("root");

if (rootElement) {
    API.initialize();
    PermissionStore.initialize();
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
