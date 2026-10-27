import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountQueryKey, useSession } from "~shared/auth";
import { IdentitySDK } from "~shared/api/sdk";

export function useProfileQuery() {
    const session = useSession();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: API.Identity.ProfileUpdateBody) => {
            await IdentitySDK.profileControllerUpdate({
                body,
                throwOnError: true,
            });
        },
        onSuccess: (_, body) => {
            queryClient.setQueryData<Auth.Account.Details>([...accountQueryKey, session.revision], (current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    profile: { ...current.profile, ...body },
                };
            });

            void queryClient.invalidateQueries({
                queryKey: ["profile", session.revision],
            });

            void queryClient.invalidateQueries({
                queryKey: [...accountQueryKey, session.revision],
            });
        },
    });
}
