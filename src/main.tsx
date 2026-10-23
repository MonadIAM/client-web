import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { PermissionStore } from "~auth/permission";
import { AuthWorkerClient } from "~auth";
import { Router } from "~router";
import { API } from "~api";

import "~assets/styles/index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    API.initialize();
    PermissionStore.initialize();
    const initialization = AuthWorkerClient.initialize();
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <Router initialization={initialization} />
        </StrictMode>,
    );
} else {
    throw new Error("Root element #root was not found");
}
