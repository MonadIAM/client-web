import type { z } from "zod";

import type { NotificationPreviewSchema } from "./schema";

declare global {
    namespace NotificationPreviewView.Item {
        type Props = {
            item: z.infer<typeof NotificationPreviewSchema.list>["data"][number];
            date: string;
        };
    }
}
