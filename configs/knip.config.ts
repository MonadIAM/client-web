import { KnipConfig } from "knip";

const config: KnipConfig = {
    "openapi-ts": {
        config: ["hey-api.config.mjs"], // Use the project's custom generator config filename.
    },
    ignoreExportsUsedInFile: true,      // Ignore exports used only inside their own module.
    ignoreBinaries: ["gitleaks"],       // Installed on the host, not through pnpm.
    project: ["src/**/*.{ts,tsx,css}"], // Include application source and CSS imports.
    entry: [
        "src/shared/api/{schemas,sdk}.ts",
        "src/**/index.ts",
        "index.html",
    ],
};

export default config;
