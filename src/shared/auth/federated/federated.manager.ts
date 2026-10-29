import { IdentitySDK } from "~shared/api/sdk";
import { i18n } from "~shared/i18n";
import { API } from "~shared/api";

import { FederatedSchema } from "./federated.schema";

class Manager implements Auth.Federated.Contract {
    public static readonly instance = new Manager();

    public readonly storageKey = "monadiam.federated";
    public completion: Optional<Auth.Federated.Complete.Result>;

    private constructor() {}

    public async authorize(props: Auth.Federated.Authorize.Props): Auth.Federated.Authorize.Result {
        const response = await IdentitySDK.federatedAuthnControllerAuthorize({
            query: { ...props, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            axios: API.identityPublic,
            throwOnError: true,
        });
        const url = new URL(FederatedSchema.authorization.parse(response.data).url);
        const transaction = FederatedSchema.transaction.parse({
            provider: props.provider,
            state: url.searchParams.get("state"),
            createdAt: Date.now(),
        });
        sessionStorage.setItem(this.storageKey, JSON.stringify(transaction));
        this.completion = undefined;
        location.assign(url.href);
    }

    public complete(props: Auth.Federated.Complete.Props): Auth.Federated.Complete.Result {
        this.completion ??= this.exchange(props);
        return this.completion;
    }

    public async exchange({ address }: Auth.Federated.Complete.Props): Auth.Federated.Complete.Result {
        const stored = sessionStorage.getItem(this.storageKey);
        sessionStorage.removeItem(this.storageKey);

        const transaction = FederatedSchema.transaction.parse(JSON.parse(stored ?? "null"));
        const age = Date.now() - transaction.createdAt;
        const url = new URL(address);

        if (
            url.searchParams.get("state") !== transaction.state ||
            url.searchParams.get("provider") !== transaction.provider ||
            age < 0 ||
            age > Number(process.env.AUTH_TRANSACTION_TTL_MS)
        ) {
            throw new Error(i18n.t("social.invalidCallback"));
        }

        const error = url.searchParams.get("error");
        if (error) {
            throw new Error(error);
        }

        const code = url.searchParams.get("code");
        if (!code) {
            throw new Error(i18n.t("social.invalidCallback"));
        }

        const response = await IdentitySDK.federatedAuthnControllerCallback({
            axios: API.identityPublic,
            body: {
                provider: transaction.provider,
                state: transaction.state,
                iss: url.searchParams.get("iss") ?? undefined,
                code,
            },
            throwOnError: true,
        });

        const result = FederatedSchema.result.parse(response.data);
        const destination = new URL(result.authorizationUrl);
        const expected = new URL(process.env.OAUTH_REDIRECT_URI);

        if (destination.origin !== expected.origin || destination.pathname !== expected.pathname) {
            throw new Error(i18n.t("auth.invalidCallback"));
        }

        return result;
    }
}

export const FederatedManager: Auth.Federated.PublicContract = Manager.instance;
