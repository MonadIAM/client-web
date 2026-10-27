import { z } from "zod";

import { WorkerCommand, WorkerMessageKind } from "~shared/auth/enums";

import { OAuthSchema } from "./oauth/oauth.schema";

export abstract class WorkerSchema {
    private constructor() {}

    public static readonly tokenProps = z.object({
        revision: z.string().optional(),
        rejectedToken: z.string().optional(),
    });

    public static readonly command = z.discriminatedUnion("command", [
        z.object({ command: z.literal(WorkerCommand.SNAPSHOT) }),
        z.object({ command: z.literal(WorkerCommand.AUTHORIZE) }),
        z.object({ command: z.literal(WorkerCommand.CALLBACK), address: z.url() }),
        z.object({ command: z.literal(WorkerCommand.TOKEN), props: this.tokenProps }),
        z.object({ command: z.literal(WorkerCommand.LOGOUT) }),
        z.object({ command: z.literal(WorkerCommand.INVALIDATE_PERMISSIONS) }),
    ]);

    public static readonly request = z.object({
        id: z.string(),
        payload: this.command,
    });

    public static readonly snapshotResult = z.object({
        command: z.literal(WorkerCommand.SNAPSHOT),
        value: OAuthSchema.snapshot,
    });

    public static readonly authorizeResult = z.object({
        command: z.literal(WorkerCommand.AUTHORIZE),
        value: z.url(),
    });

    public static readonly tokenResult = z.object({
        command: z.literal(WorkerCommand.TOKEN),
        value: OAuthSchema.credential,
    });

    public static readonly payload = z.discriminatedUnion("command", [
        this.snapshotResult,
        this.authorizeResult,
        this.tokenResult,
        z.object({ command: z.literal(WorkerCommand.CALLBACK), value: OAuthSchema.snapshot }),
        z.object({ command: z.literal(WorkerCommand.LOGOUT), value: OAuthSchema.snapshot }),
        z.object({ command: z.literal(WorkerCommand.INVALIDATE_PERMISSIONS) }),
    ]);

    public static readonly response = z.discriminatedUnion("kind", [
        z.object({ kind: z.literal(WorkerMessageKind.RESULT), id: z.string(), payload: this.payload }),
        z.object({ kind: z.literal(WorkerMessageKind.ERROR), id: z.string(), message: z.string() }),
        z.object({ kind: z.literal(WorkerMessageKind.SESSION), value: OAuthSchema.snapshot }),
        z.object({ kind: z.literal(WorkerMessageKind.PERMISSIONS) }),
    ]);
}
