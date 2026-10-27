import { useMutation } from "@tanstack/react-query";

import { NotificationManager } from "~shared/notifications";
import { IdentitySDK } from "~shared/api/sdk";
import { API } from "~shared/api";

import { PasswordRecoveryStep } from "../steps";

export function useResetPasswordQuery(method: PasswordRecovery.Method) {
    return useMutation({
        mutationFn: async (body: API.Identity.PasswordResetByOTPBody | API.Identity.PasswordResetByRecoveryCodeBody) => {
            const reset =
                method === PasswordRecoveryStep.OTP
                    ? IdentitySDK.passwordControllerResetByOtp
                    : IdentitySDK.passwordControllerResetByRecoveryCode;
            const response = await reset({ axios: API.identityPublic, body, throwOnError: true });
            return response.data;
        },
        onSuccess: (data) => {
            NotificationManager.response({ data });
        },
    });
}
