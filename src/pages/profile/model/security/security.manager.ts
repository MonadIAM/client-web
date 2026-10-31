import { IdentitySDK } from "~shared/api/sdk";

import { SecurityAuthentication } from "./enums";
import { SecuritySchema } from "./schema";

class Manager implements Security.Manager.PublicContract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async status({ signal }: Security.Manager.Status.Props): Security.Manager.Status.Result {
        const response = await IdentitySDK.accountControllerGetSecurity({
            signal,
            throwOnError: true,
        });
        return SecuritySchema.status.parse(response.data);
    }

    public async requestCode(): Security.Manager.RequestCode.Result {
        await IdentitySDK.authnControllerRequestReauthenticationOtp({
            throwOnError: true,
        });
    }

    public async authenticate(input: Security.Manager.Authenticate.Props): Security.Manager.Authenticate.Result {
        if (input.method === SecurityAuthentication.PASSWORD) {
            await IdentitySDK.authnControllerReauthenticateByPassword({
                body: { password: input.password },
                throwOnError: true,
            });
        } else if (input.method === SecurityAuthentication.SECOND_FACTOR) {
            await IdentitySDK.authnControllerReauthenticateBySecondFactor({
                body: { code: input.code },
                throwOnError: true,
            });
        } else {
            await IdentitySDK.authnControllerReauthenticateByOtp({
                body: { code: input.code },
                throwOnError: true,
            });
        }
    }
}

export const SecurityManager: Security.Manager.PublicContract = Manager.instance;
