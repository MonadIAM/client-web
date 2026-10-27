import { IdentitySDK } from "~shared/api/sdk";

import { SecurityAuthentication } from "./enums";

class Manager implements Security.Manager.PublicContract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async authenticate(input: Security.Manager.Authenticate.Props): Security.Manager.Authenticate.Result {
        if (input.method === SecurityAuthentication.PASSWORD) {
            await IdentitySDK.authnControllerReauthenticateByPassword({
                body: { password: input.password },
                throwOnError: true,
            });
        } else {
            await IdentitySDK.authnControllerReauthenticateBySecondFactor({
                body: { code: input.code },
                throwOnError: true,
            });
        }
    }
}

export const SecurityManager: Security.Manager.PublicContract = Manager.instance;
