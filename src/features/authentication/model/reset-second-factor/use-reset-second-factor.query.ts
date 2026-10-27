import { useMutation } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";
import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

export function useResetSecondFactorQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.SecondFactorResetBody) => {
            const response = await IdentitySDK.secondFactorControllerReset({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: (data) => {
            NotificationManager.response({ data });
        },
    });
}
