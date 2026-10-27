import { z } from "zod";

export abstract class SessionsSchema {
    private constructor() {}

    public static readonly session = z.object({
        id: z.uuid(),
        userAgent: z.string(),
        ip: z
            .string()
            .nullish()
            .transform((value) => value ?? undefined),
        createdAt: z.iso.datetime(),
        lastRefreshedAt: z.iso.datetime().nullish(),
        expiresAt: z.iso.datetime().nullish(),
    });

    public static readonly list = z.object({
        data: z.array(SessionsSchema.session),
    });

    public static readonly revoke = z.object({
        sessions: z.array(z.uuid()).min(1),
    });
}
