import type { KnipConfig } from "knip";

const config: KnipConfig = {
    ignoreExportsUsedInFile: true,      // Ignore exports used only inside their own module.
    ignoreBinaries: ["gitleaks"],       // Installed on the host, not through pnpm.
    project: ["src/**/*.{ts,tsx,css}"], // Include application source and CSS imports.
    entry: ["index.html"],              // Rspack loads the application from this HTML entry point.
};

export default config;
