import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";
import { fileURLToPath } from "node:url";
import { rspack } from "@rspack/core";
import "dotenv/config";

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
            extensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
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
                { test: /\.css$/i, type: "css/auto" },
            ],
        },
        plugins: [
            new rspack.HtmlRspackPlugin({ template: "./index.html" }),
            ...(development ? [new ReactRefreshRspackPlugin()] : []),
        ],
        devServer: {
            host: "127.0.0.1",
            port: 3000,
            historyApiFallback: true,
        },
    };
};
