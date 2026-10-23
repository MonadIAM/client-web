import { z } from "zod";

import { OAuthSchema } from "./oauth.schema";

export abstract class WorkerSchema {
    private constructor() {}

    public static readonly tokenProps = z.object({
        revision: z.string().optional(),
        rejectedToken: z.string().optional(),
    });

    public static readonly command = z.discriminatedUnion("command", [
        z.object({ command: z.literal("snapshot") }),
        z.object({ command: z.literal("authorize") }),
        z.object({ command: z.literal("callback"), address: z.url() }),
        z.object({ command: z.literal("token"), props: this.tokenProps }),
        z.object({ command: z.literal("logout") }),
        z.object({ command: z.literal("invalidatePermissions") }),
    ]);

    public static readonly request = z.object({
        id: z.string(),
        payload: this.command,
    });

    public static readonly snapshotResult = z.object({
        command: z.literal("snapshot"),
        value: OAuthSchema.snapshot,
    });

    public static readonly authorizeResult = z.object({
        command: z.literal("authorize"),
        value: z.url(),
    });

    public static readonly tokenResult = z.object({
        command: z.literal("token"),
        value: OAuthSchema.credential,
    });

    public static readonly payload = z.discriminatedUnion("command", [
        this.snapshotResult,
        this.authorizeResult,
        this.tokenResult,
        z.object({ command: z.literal("callback"), value: OAuthSchema.snapshot }),
        z.object({ command: z.literal("logout"), value: OAuthSchema.snapshot }),
        z.object({ command: z.literal("invalidatePermissions") }),
    ]);

    public static readonly response = z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("result"), id: z.string(), payload: this.payload }),
        z.object({ kind: z.literal("error"), id: z.string(), message: z.string() }),
        z.object({ kind: z.literal("session"), value: OAuthSchema.snapshot }),
        z.object({ kind: z.literal("permissions") }),
    ]);
}
