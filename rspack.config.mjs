import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";
import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";
import { rspack } from "@rspack/core";

await tsImport("./env.schema.ts", import.meta.url);

const root = fileURLToPath(new URL(".", import.meta.url));

export default (_environment, argv) => {
    const development = argv.mode === "development";

    return {
        context: root,
        mode: development ? "development" : "production",
        entry: "./src/main.tsx",
        output: {
            path: fileURLToPath(new URL("dist", import.meta.url)),
            publicPath: "/",
            clean: true,
        },
        resolve: {
            tsConfig: { configFile: fileURLToPath(new URL("./tsconfig.json", import.meta.url)) },
            extensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules\/(?!.*@monadiam[+/]ui-kit)/,
                    use: {
                        loader: "builtin:swc-loader",
                        options: {
                            jsc: {
                                parser: { syntax: "typescript", tsx: true },
                                transform: {
                                    react: {
                                        runtime: "automatic",
                                        development,
                                        refresh: development,
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    test: /\.css$/i,
                    type: "css/auto",
                    use: {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [tailwindcss()],
                            },
                        },
                    },
                },
            ],
        },
        plugins: [
            new rspack.DefinePlugin(
                Object.fromEntries([
                    "ACCESS_CONTROL_ORIGIN",
                    "IDENTITY_ORIGIN",
                    "NOTIFICATION_ORIGIN",
                    "ORGANIZATION_ORIGIN",
                    "HR_ORIGIN",
                    "OAUTH_ISSUER",
                    "OAUTH_CLIENT_ID",
                    "OAUTH_REDIRECT_URI",
                    "OAUTH_SCOPE",
                    "API_REQUEST_TIMEOUT_MS",
                    "AUTH_REQUEST_TIMEOUT_MS",
                    "AUTH_WORKER_TIMEOUT_MS",
                    "AUTH_REFRESH_LEEWAY_MS",
                    "AUTH_REFRESH_LEEWAY_RATIO",
                    "AUTH_TRANSACTION_TTL_MS",
                    "AUTH_IAT_TOLERANCE_MS",
                    "AUTH_PERMISSION_STALE_TIME_MS",
                ].map((name) => [`process.env.${name}`, JSON.stringify(process.env[name])])),
            ),
            new rspack.HtmlRspackPlugin({ template: "./index.html" }),
            ...(development ? [new ReactRefreshRspackPlugin()] : []),
        ],
        devServer: {
            host: "localhost",
            port: 3000,
            historyApiFallback: true,
        },
    };
};
