import { useMutation } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

export function useSecondFactorQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AuthnVerifySecondFactorBody) => {
            const response = await IdentitySDK.authnControllerVerifySecondFactor({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return response.data;
        },
    });
}
