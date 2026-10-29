import { useInfiniteQuery, useMutation, useQuery, useQueryClient, skipToken } from "@tanstack/react-query";

import { QueryOrder } from "~shared/api/generated/notification";
import { NotificationManager } from "~shared/notifications";
import { SessionStatus } from "~shared/auth/session";
import { NotificationSDK } from "~shared/api/sdk";
import { useSession } from "~shared/auth";

import { NotificationPreviewSchema } from "./schema";

export function useUnreadNotificationCount() {
    const session = useSession();

    return useQuery<number>({
        queryKey: ["notification-unread-count", session.revision],
        queryFn: skipToken,
        staleTime: Infinity,
    });
}

export function useNotificationPreview(open: boolean) {
    const session = useSession();

    return useInfiniteQuery({
        queryKey: ["notification-preview", session.revision],
        enabled: open && session.status === SessionStatus.AUTHENTICATED,
        initialPageParam: 1,
        queryFn: async ({ signal, pageParam }) => {
            const response = await NotificationSDK.notificationControllerFindMany({
                body: {
                    pagination: {
                        currentPage: pageParam,
                        elementsPerPage: 10,
                    },
                    sort: {
                        createdAt: QueryOrder.DESC,
                    },
                    filters: {},
                },
                signal,
                throwOnError: true,
            });

            return NotificationPreviewSchema.list.parse(response.data);
        },
        getNextPageParam: (lastPage, _pages, lastPageParam) =>
            lastPageParam < lastPage.meta.totalPages ? lastPageParam + 1 : undefined,
        staleTime: 0,
    });
}

export function useMarkNotificationRead() {
    const session = useSession();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (message: string) => {
            await NotificationSDK.messageControllerMarkRead({
                body: { message },
                throwOnError: true,
            });
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ["notification-preview", session.revision],
            }),
        onError: (cause) => NotificationManager.error({ cause }),
    });
}
