import { useEffect, useEffectEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
    NotificationStreamClient,
    NotificationStreamMessage,
    NotificationStreamStatus,
} from "~shared/notifications/stream";
import { useNotificationSound } from "~shared/notifications/sound";
import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

export function useNotificationStream(): NotificationPreviewView.UseStream.Result {
    const session = useSession();
    const queryClient = useQueryClient();
    const { play, ready } = useNotificationSound();
    const [state, setState] = useState<Nullable<Notifications.Stream.State>>(null);
    const notify = useEffectEvent(() => void play({ automatic: true }));

    useEffect(() => {
        if (session.status !== SessionStatus.AUTHENTICATED) {
            return undefined;
        }

        const unsubscribe = NotificationStreamClient.subscribe({
            listener: (response) => {
                if (response.kind === NotificationStreamMessage.STATE && response.value.revision === session.revision) {
                    const update = response.value;
                    setState(update);
                    if (update.count !== null) {
                        queryClient.setQueryData(["notification-unread-count", session.revision], update.count);
                    }
                    if (update.status === NotificationStreamStatus.CONNECTED) {
                        void queryClient.invalidateQueries({ queryKey: ["notification-preview", session.revision] });
                    }
                } else if (response.kind === NotificationStreamMessage.SOUND && response.revision === session.revision) {
                    notify();
                }
            },
        });

        return unsubscribe;
    }, [session.status, session.revision, queryClient]);

    useEffect(() => {
        if (session.status === SessionStatus.AUTHENTICATED) {
            NotificationStreamClient.audio({ ready });
        }
    }, [session.status, session.revision, ready]);

    return {
        isError: state?.revision === session.revision && state?.status === NotificationStreamStatus.ERROR,
        retry: () => NotificationStreamClient.retry(),
    };
}
