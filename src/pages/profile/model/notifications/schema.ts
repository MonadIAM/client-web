import { z } from "zod";

import { ChannelType, NotificationCategory } from "~shared/api/generated/notification";

export abstract class NotificationSettingsSchema {
    private constructor() {}

    public static readonly channel = z.object({
        id: z.uuid(),
        type: z.enum(ChannelType),
        soundEnabled: z.boolean().nullish(),
    });

    public static readonly preference = z.object({
        channelType: z.enum(ChannelType),
        category: z.enum(NotificationCategory),
        isDuplicationEnabled: z.boolean(),
    });

    public static readonly recipient = z.object({
        id: z.uuid(),
        locale: z.string(),
        timezone: z.string(),
    });

    public static readonly channels = z.object({
        data: z.array(NotificationSettingsSchema.channel),
        meta: z.object({ totalPages: z.number().int().nonnegative() }),
    });

    public static readonly preferences = z.object({
        data: z.array(NotificationSettingsSchema.preference),
        meta: z.object({ totalPages: z.number().int().nonnegative() }),
    });
}
