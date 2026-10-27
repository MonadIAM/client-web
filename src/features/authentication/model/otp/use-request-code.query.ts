import { useMutation } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";
import { IdentitySDK } from "~shared/api/sdk";
import { CooldownOTP } from "~shared/auth";
import { OTPFlow } from "~shared/auth/otp";
import { API } from "~shared/api";

export function useRequestCodeQuery() {
    return useMutation({
        mutationFn: async (body: API.Identity.AuthnRequestOTPBody) => {
            const response = await IdentitySDK.authnControllerRequestOtp({
                axios: API.identityPublic,
                body,
                throwOnError: true,
            });
            return response.data;
        },
        onSuccess: (data) => {
            CooldownOTP.start({ flow: OTPFlow.SIGNIN });
            NotificationManager.response({ data });
        },
        onError: (cause) => {
            CooldownOTP.recover({ flow: OTPFlow.SIGNIN, cause });
        },
    });
}
