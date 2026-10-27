import { QueryCache, QueryClient } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";

export const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            retry: false,
            networkMode: "always",
            gcTime: 0,
        },
        queries: {
            retry: false,
        },
    },
    queryCache: new QueryCache({
        onError: (cause) => NotificationManager.error({ cause }),
    }),
});
