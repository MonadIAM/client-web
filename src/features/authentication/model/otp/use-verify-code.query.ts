import { useMutation } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

export function useVerifyCodeQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AuthnVerifyOTPBody) => {
            const response = await IdentitySDK.authnControllerVerifyOtp({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return response.data;
        },
    });
}
