import { IdentitySDK } from "~shared/api/sdk";

import { PasswordResetMethod } from "./enums";
import { DangerZoneSchema } from "./schema";

class Manager implements AccountDangerZone.Manager.PublicContract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async setPassword(
        body: AccountDangerZone.Manager.SetPassword.Props,
    ): AccountDangerZone.Manager.SetPassword.Result {
        await IdentitySDK.passwordControllerSet({
            body,
            throwOnError: true,
        });
    }

    public async changePassword(
        body: AccountDangerZone.Manager.ChangePassword.Props,
    ): AccountDangerZone.Manager.ChangePassword.Result {
        await IdentitySDK.passwordControllerChange({
            body,
            throwOnError: true,
        });
    }

    public async requestPasswordReset(): AccountDangerZone.Manager.RequestPasswordReset.Result {
        await IdentitySDK.passwordControllerRequestCurrentOtp({ throwOnError: true });
    }

    public async resetPassword({
        method,
        ...body
    }: AccountDangerZone.Manager.ResetPassword.Props): AccountDangerZone.Manager.ResetPassword.Result {
        if (method === PasswordResetMethod.OTP) {
            await IdentitySDK.passwordControllerResetCurrentByOtp({ body, throwOnError: true });
        } else {
            await IdentitySDK.passwordControllerResetCurrentByRecoveryCode({ body, throwOnError: true });
        }
    }

    public async regenerateCodes(): AccountDangerZone.Manager.RegenerateCodes.Result {
        const response = await IdentitySDK.recoveryCodeControllerRegenerate({
            throwOnError: true,
        });
        return DangerZoneSchema.codes.parse(response.data).codes;
    }

    public async deactivate(): AccountDangerZone.Manager.Deactivate.Result {
        await IdentitySDK.accountControllerDeactivate({
            throwOnError: true,
        });
    }
}

export const DangerZoneManager: AccountDangerZone.Manager.PublicContract = Manager.instance;
