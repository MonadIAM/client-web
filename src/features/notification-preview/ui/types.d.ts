import type { z } from "zod";

import type { NotificationCategory } from "~shared/api/generated/notification";

import type { NotificationPreviewSchema } from "../model/schema";

declare global {
    namespace NotificationPreviewView {
        namespace Item {
            type Props = {
                item: z.infer<typeof NotificationPreviewSchema.list>["data"][number];
                date: string;
            };
        }

        namespace CategoryIcon {
            type Props = {
                category: NotificationCategory;
                active?: boolean;
                disabled?: boolean;

                onRead?(): void;
            };
        }
    }
}
