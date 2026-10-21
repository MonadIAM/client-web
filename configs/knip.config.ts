import type { KnipConfig } from "knip";

const config: KnipConfig = {
    ignoreExportsUsedInFile: true,
    project: ["src/**/*.{ts,tsx,css}"],
    entry: ["index.html"],
};

export default config;
