import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { QueryOrder } from "~shared/api/generated/notification";
import { SessionStatus } from "~shared/auth/session";
import { NotificationSDK } from "~shared/api/sdk";
import { useSession } from "~shared/auth";

import { NotificationPreviewSchema } from "./schema";

export function useUnreadNotificationCount() {
    const session = useSession();

    return useQuery({
        queryKey: ["notification-unread-count", session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: async ({ signal }) => {
            const response = await NotificationSDK.notificationControllerCountUnread({ signal, throwOnError: true });
            return NotificationPreviewSchema.count.parse(response.data).count;
        },
        refetchInterval: 30_000,
        staleTime: 30_000,
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
                    filters: {},
                    sort: { createdAt: QueryOrder.DESC },
                },
                signal,
                throwOnError: true,
            });

            return NotificationPreviewSchema.list.parse(response.data);
        },
        getNextPageParam: (lastPage, _pages, lastPageParam) =>
            lastPageParam < lastPage.meta.totalPages ? lastPageParam + 1 : undefined,
        staleTime: 0,
        refetchInterval: open ? 30_000 : false,
    });
}
