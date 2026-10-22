import type { KnipConfig } from "knip";

const config: KnipConfig = {
    "openapi-ts": {
        config: ["hey-api.config.mjs"], // Use the project's custom generator config filename.
    },
    ignoreExportsUsedInFile: true,      // Ignore exports used only inside their own module.
    ignoreBinaries: ["gitleaks"],       // Installed on the host, not through pnpm.
    project: ["src/**/*.{ts,tsx,css}"], // Include application source and CSS imports.
    entry: ["index.html"],              // Rspack loads the application from this HTML entry point.
    ignoreDependencies: [
        // Used by generated API clients, which are excluded through .gitignore.
        "@tanstack/react-query",
        "axios",
    ],
};

export default config;
