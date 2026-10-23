import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Spinner } from "@monadiam/ui-kit";
import { StrictMode } from "react";

import { PermissionStorage } from "~auth/permission";
import { AuthClient } from "~auth";
import { Router } from "~router";
import { API } from "~api";

import "~assets/styles/index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    API.initialize();
    PermissionStorage.initialize();
    const root = createRoot(rootElement);
    root.render(<Spinner className="min-h-dvh" />);
    void AuthClient.initialize().then(() =>
        root.render(
            <StrictMode>
                <QueryClientProvider client={PermissionStorage.client}>
                    <BrowserRouter>
                        <Router />
                    </BrowserRouter>
                </QueryClientProvider>
            </StrictMode>,
        ),
    );
} else {
    throw new Error("Root element #root was not found");
}
