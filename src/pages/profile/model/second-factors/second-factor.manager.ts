import { IdentitySDK } from "~shared/api/sdk";

import { SecondFactorSchema } from "./schema";

class Manager implements SecondFactors.Manager.PublicContract {
    public static readonly instance = new Manager();

    private constructor() {}

    public async list({ signal }: SecondFactors.Manager.List.Props): SecondFactors.Manager.List.Result {
        const response = await IdentitySDK.secondFactorControllerGetList({ signal, throwOnError: true });

        return SecondFactorSchema.list.parse(response.data).data;
    }

    public async create(body: SecondFactors.Manager.Create.Props): SecondFactors.Manager.Create.Result {
        const response = await IdentitySDK.secondFactorControllerCreate({ body, throwOnError: true });

        return SecondFactorSchema.setup.parse(response.data);
    }

    public async setup({ id, signal }: SecondFactors.Manager.Setup.Props): SecondFactors.Manager.Setup.Result {
        const response = await IdentitySDK.secondFactorControllerGetQrCode({
            query: { id },
            signal,
            throwOnError: true,
        });

        return SecondFactorSchema.setup.parse(response.data);
    }

    public async verify(body: SecondFactors.Manager.Verify.Props): SecondFactors.Manager.Verify.Result {
        const response = await IdentitySDK.secondFactorControllerVerify({ body, throwOnError: true });

        return SecondFactorSchema.verification.parse(response.data);
    }

    public async remove(query: SecondFactors.Manager.Remove.Props): SecondFactors.Manager.Remove.Result {
        await IdentitySDK.secondFactorControllerPurge({ query, throwOnError: true });
    }

    public secret({ uri }: SecondFactors.Manager.Secret.Props): SecondFactors.Manager.Secret.Result {
        return new URL(uri).searchParams.get("secret") ?? "";
    }
}

export const SecondFactorManager: SecondFactors.Manager.PublicContract = Manager.instance;
