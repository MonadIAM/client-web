import { z } from "zod";

import { ChannelType, NotificationCategory } from "~shared/api/generated/notification";

export abstract class NotificationPreviewSchema {
    private constructor() {}

    public static readonly list = z.object({
        data: z.array(
            z.object({
                id: z.uuid(),
                category: z.enum(NotificationCategory),
                locale: z.string().nullable(),
                title: z.string().nullish(),
                body: z.string().nullish(),
                createdAt: z.iso.datetime({ offset: true }),
                message: z
                    .object({
                        id: z.uuid(),
                        channelType: z.literal(ChannelType.IN_APP),
                        readAt: z.iso.datetime({ offset: true }).nullish(),
                    })
                    .nullable(),
            }),
        ),
        meta: z.object({ totalPages: z.number().int().nonnegative() }),
    });
}
