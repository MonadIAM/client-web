import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { App } from "./app";
import "./assets/styles/index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
} else {
    throw new Error("Root element #root was not found");
}
