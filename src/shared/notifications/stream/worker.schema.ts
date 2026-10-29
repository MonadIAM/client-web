import { z } from "zod";

import { NotificationStreamCommand, NotificationStreamMessage, NotificationStreamStatus } from "./enums";

export abstract class NotificationStreamSchema {
    private constructor() {}

    public static readonly event = z.object({
        count: z.number().int().nonnegative(),
        message: z.uuid().nullable(),
        soundEnabled: z.boolean(),
    });

    public static readonly state = z.object({
        revision: z.string(),
        count: z.number().int().nonnegative().nullable(),
        status: z.enum(NotificationStreamStatus),
    });

    public static readonly command = z.discriminatedUnion("command", [
        z.object({ command: z.literal(NotificationStreamCommand.ATTACH), revision: z.string(), audioReady: z.boolean() }),
        z.object({ command: z.literal(NotificationStreamCommand.AUDIO), revision: z.string(), audioReady: z.boolean() }),
        z.object({ command: z.literal(NotificationStreamCommand.DETACH) }),
        z.object({ command: z.literal(NotificationStreamCommand.RETRY) }),
        z.object({ command: z.literal(NotificationStreamCommand.END_SESSION), revision: z.string() }),
        z.object({
            command: z.literal(NotificationStreamCommand.TOKEN),
            id: z.uuid(),
            revision: z.string(),
            token: z.string().nullable(),
        }),
    ]);

    public static readonly response = z.discriminatedUnion("kind", [
        z.object({ kind: z.literal(NotificationStreamMessage.STATE), value: this.state }),
        z.object({ kind: z.literal(NotificationStreamMessage.SOUND), revision: z.string(), message: z.uuid() }),
        z.object({
            kind: z.literal(NotificationStreamMessage.TOKEN),
            id: z.uuid(),
            revision: z.string(),
            rejectedToken: z.string().optional(),
        }),
    ]);
}
