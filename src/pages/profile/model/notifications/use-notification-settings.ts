import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";
import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { NotificationSettingsManager } from "./notification-settings.manager";

export const notificationSettingsQueryKey = ["notification-settings"];

export function useNotificationSettings() {
    const session = useSession();
    const queryClient = useQueryClient();
    const queryKey = [...notificationSettingsQueryKey, session.revision];

    const query = useQuery({
        queryKey,
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: ({ signal }) => NotificationSettingsManager.get({ signal }),
    });

    const onSettled = () => queryClient.invalidateQueries({ queryKey });
    const onError = (cause: unknown) => NotificationManager.error({ cause });

    const sound = useMutation({
        mutationFn: NotificationSettingsManager.toggleSound,
        retry: false,
        onSettled,
        onError,
    });

    const email = useMutation({
        mutationFn: NotificationSettingsManager.toggleEmail,
        retry: false,
        onSettled,
        onError,
    });

    const disabled = query.isFetching || query.isError || sound.isPending || email.isPending;

    return { query, sound, email, disabled };
}
