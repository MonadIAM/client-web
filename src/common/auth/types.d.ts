import { createRemoteJWKSet } from "jose";
import { z } from "zod";

import { WorkerSchema } from "./worker.schema";
import { OAuthSchema } from "./oauth.schema";

declare global {
    namespace Auth {
        type Listener = () => void;

        type Unsubscribe = () => void;

        namespace OAuth {
            type Metadata = API.Identity.OpenIdConfiguration;

            type KeySet = ReturnType<typeof createRemoteJWKSet>;

            type Tokens = z.infer<typeof OAuthSchema.tokens>;

            type Identity = z.infer<typeof OAuthSchema.identity>;

            type Authentication = z.infer<typeof OAuthSchema.authentication>;

            namespace Authorize {
                type Props = Session.Transaction;

                type Result = Promise<string>;
            }

            namespace Exchange {
                type Props = {
                    url: URL;
                    transaction: Session.Transaction;
                };

                type Result = Promise<Identity>;
            }

            namespace ValidateIdentity {
                type Props = {
                    token: string;
                    accessToken: string;
                    nonce: string;
                    session: string;
                };

                type Result = Promise<void>;
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
            }

            namespace Refresh {
                type Props = {
                    token: string;
                };

                type Result = Promise<Identity>;
            }

            namespace Revoke {
                type Props = {
                    token: string;
                };

                type Result = Promise<void>;
            }
        }

        namespace Worker {
            type Command = z.infer<typeof WorkerSchema.command>;

            type Request = z.infer<typeof WorkerSchema.request>;

            type Payload = z.infer<typeof WorkerSchema.payload>;

            type Response = z.infer<typeof WorkerSchema.response>;

            namespace Execute {
                type Props = Command;

                type Result = Promise<Payload>;
            }
        }

        namespace Client {
            type Authorization = {
                url: Optional<string>;
                error: Optional<string>;
            };

            type Pending = {
                timeout: ReturnType<typeof setTimeout>;
                resolve(payload: Worker.Payload): void;
                reject(error: Error): void;
            };

            namespace Send {
                type Props = Worker.Command;

                type Result = Promise<Worker.Payload>;
            }

            namespace Receive {
                type Props = Worker.Response;

                type Result = void;
            }
        }
    }
}
