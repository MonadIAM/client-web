import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { useUnreadNotificationCount } from "./use-notification-preview";

export function useNotificationTitle(
    title: NotificationPreviewView.UseTitle.Props,
): NotificationPreviewView.UseTitle.Result {
    const session = useSession();
    const { data: count } = useUnreadNotificationCount();

    if (session.status === SessionStatus.AUTHENTICATED && count !== undefined && count > 0) {
        return `(${count}) ${title}`;
    } else {
        return title;
    }
}
