import { defineConfig } from "@hey-api/openapi-ts";
import { tsImport } from "tsx/esm/api";

await tsImport("./env.schema.ts", import.meta.url);

const service = process.env.OPENAPI_SERVICE;
const tag = process.env.OPENAPI_TAG;

const origins = {
    "access-control": process.env.ACCESS_CONTROL_ORIGIN,
    "notification": process.env.NOTIFICATION_ORIGIN,
    "organization": process.env.ORGANIZATION_ORIGIN,
    "identity": process.env.IDENTITY_ORIGIN,
    "hr": process.env.HR_ORIGIN,
};

const origin = origins[service];

export default defineConfig({
    input: new URL("/docs/openapi.json", origin).href,
    output: {
        path: `./src/shared/api/generated/${tag ? `${service}/${tag}` : service}`,
        clean: Boolean(tag),
    },
    ...(tag && {
        parser: {
            filters: {
                tags: {
                    include: [tag],
                },
            },
        },
    }),
    plugins: [
        {
            name: "@hey-api/typescript",
            enums: "typescript",
            definitions: { case: "preserve" },
            includeInEntry: (symbol) => symbol.meta.resourceId?.startsWith("#/components/schemas/")
                && symbol.meta.resourceId.split("/").length === 4,
        },
        {
            name: "@hey-api/transformers",
            dates: true,
        },
        {
            name: "@hey-api/client-axios",
            includeInEntry: false,
        },
        {
            name: "@hey-api/sdk",
            auth: false,
            transformer: true,
            includeInEntry: false,
        },
        "@tanstack/react-query",
        "zod",
    ],
});
