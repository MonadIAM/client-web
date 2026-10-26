import { createRemoteJWKSet } from "jose";
import { z } from "zod";

import { OAuthSchema } from "./oauth.schema";

declare global {
    namespace Auth.OAuth {
        type Metadata = API.Identity.OpenIdConfiguration;

        type Authentication = z.infer<typeof OAuthSchema.authentication>;

        type Identity = z.infer<typeof OAuthSchema.identity>;

        type KeySet = ReturnType<typeof createRemoteJWKSet>;

        type Tokens = z.infer<typeof OAuthSchema.tokens>;

        interface Contract extends PublicContract, PrivateContract {}

        interface PublicContract {
            randomValue: RandomValue.Signature;
            authorize: Authorize.Signature;
            exchange: Exchange.Signature;
            refresh: Refresh.Signature;
            revoke: Revoke.Signature;
        }

        namespace RandomValue {
            type Result = string;

            type Signature = () => Result;
        }

        namespace Authorize {
            type Props = Session.Transaction;

            type Result = Promise<string>;

            type Signature = (props: Props) => Result;
        }

        namespace Exchange {
            type Props = {
                transaction: Session.Transaction;
                url: URL;
            };

            type Result = Promise<Identity>;

            type Signature = (props: Props) => Result;
        }

        namespace Refresh {
            type Props = {
                token: string;
            };

            type Result = Promise<Identity>;

            type Signature = (props: Props) => Result;
        }

        namespace Revoke {
            type Props = {
                token: string;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        interface PrivateContract {
            discovery: Optional<Promise<Metadata>>;
            keys: Optional<KeySet>;

            validateIdentity: ValidateIdentity.Signature;
            getMetadata: MetadataAction.Signature;
            requestToken: RequestToken.Signature;
            discover: Discover.Signature;
        }

        namespace Discover {
            type Result = Promise<Metadata>;

            type Signature = () => Result;
        }

        namespace ValidateIdentity {
            type Props = {
                accessToken: string;
                session: string;
                nonce: string;
                token: string;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        namespace MetadataAction {
            type Result = Promise<Metadata>;

            type Signature = () => Result;
        }

        namespace RequestToken {
            type AuthorizationCodeProps = Required<
                Pick<API.Identity.OAuthTokenBody, "code" | "code_verifier" | "redirect_uri">
            > & {
                grant_type: API.Identity.TokenGrantType.AUTHORIZATION_CODE;
            };

            type RefreshProps = Required<Pick<API.Identity.OAuthTokenBody, "refresh_token">> & {
                grant_type: API.Identity.TokenGrantType.REFRESH_TOKEN;
            };

            type Props = AuthorizationCodeProps | RefreshProps;

            type Result = Promise<Identity>;

            type Signature = (props: Props) => Result;
        }

        namespace Continue {
            type Props = {
                authorizationRequest?: Nullable<string>;
                response: unknown;
            };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
        }

        namespace UseAuthentication {
            type Result = Continue.Signature;

            type Signature = () => Result;
        }
    }
}
