import { useMutation } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

import { SignupSchema } from "./schema";

export function useVerificationQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AccountVerifyBody) => {
            const response = await IdentitySDK.accountControllerVerify({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return SignupSchema.verification.parse(response.data);
        },
    });
}
