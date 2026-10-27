import { useMutation } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

export function useSigninQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AuthnPasswordBody) => {
            const response = await IdentitySDK.authnControllerPassword({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return response.data;
        },
    });
}
