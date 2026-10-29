import { useMutation } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";
import { CooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";
import { API } from "~shared/api";

export function useRegistrationQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AccountSignupBody) => {
            const response = await IdentitySDK.accountControllerSignup({
                body: { ...body, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                axios: API.identityPublic,
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: () => {
            CooldownOTP.start({ flow: OTPFlow.SIGNUP });
        },
    });
}
