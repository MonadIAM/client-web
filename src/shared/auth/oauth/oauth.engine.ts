import { base64url, createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";

import { TokenGrantType } from "~shared/api/generated/identity";

import { OAuthSchema } from "./oauth.schema";

class OAuthFlowEngine implements Auth.OAuth.Contract {
    public static readonly instance = new OAuthFlowEngine();

    public discovery: Optional<Promise<Auth.OAuth.Metadata>>;
    public keys: Optional<Auth.OAuth.KeySet>;

    private constructor() {}

    public randomValue(): Auth.OAuth.RandomValue.Result {
        return base64url.encode(crypto.getRandomValues(new Uint8Array(32)));
    }

    public async authorize(props: Auth.OAuth.Authorize.Props): Auth.OAuth.Authorize.Result {
        const metadata = await this.getMetadata();
        const url = new URL(metadata.authorization_endpoint);
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(props.verifier));
        url.search = new URLSearchParams({
            code_challenge: base64url.encode(new Uint8Array(digest)),
            code_challenge_method: "S256",
            response_type: "code",
            redirect_uri: process.env.OAUTH_REDIRECT_URI,
            client_id: process.env.OAUTH_CLIENT_ID,
            scope: process.env.OAUTH_SCOPE,
            state: props.state,
            nonce: props.nonce,
        }).toString();
        return url.href;
    }

    public async exchange(props: Auth.OAuth.Exchange.Props): Auth.OAuth.Exchange.Result {
        const expected = new URL(process.env.OAUTH_REDIRECT_URI);
        const sameAddress = props.url.origin === expected.origin && props.url.pathname === expected.pathname;
        const sameState = props.url.searchParams.get("state") === props.transaction.state;
        const sameIssuer = props.url.searchParams.get("iss") === process.env.OAUTH_ISSUER;
        const error = props.url.searchParams.get("error");
        const code = props.url.searchParams.get("code");

        if (sameAddress && sameState && sameIssuer) {
            if (error) {
                throw new Error(error);
            } else if (code) {
                const result = await this.requestToken({
                    grant_type: TokenGrantType.AUTHORIZATION_CODE,
                    redirect_uri: process.env.OAUTH_REDIRECT_URI,
                    code_verifier: props.transaction.verifier,
                    code,
                });

                if (result.tokens.id_token) {
                    await this.validateIdentity({
                        accessToken: result.tokens.access_token,
                        nonce: props.transaction.nonce,
                        token: result.tokens.id_token,
                        session: result.claims.sid,
                    });
                    return result;
                } else {
                    throw new Error("The token endpoint did not return an ID token");
                }
            } else {
                throw new Error("The authorization callback has no code");
            }
        } else {
            throw new Error("The callback does not match the authorization request");
        }
    }

    public refresh(props: Auth.OAuth.Refresh.Props): Auth.OAuth.Refresh.Result {
        return this.requestToken({ grant_type: TokenGrantType.REFRESH_TOKEN, refresh_token: props.token });
    }

    public async revoke(props: Auth.OAuth.Revoke.Props): Auth.OAuth.Revoke.Result {
        const metadata = await this.getMetadata();
        const response = await fetch(metadata.revocation_endpoint, {
            method: "POST",
            body: new URLSearchParams({
                client_id: process.env.OAUTH_CLIENT_ID,
                token: props.token,
                token_type_hint: "refresh_token",
            }),
            signal: AbortSignal.timeout(Number(process.env.AUTH_REQUEST_TIMEOUT_MS)),
        });
        if (response.ok === false) {
            throw new Error(`Session revocation failed: HTTP ${response.status}`);
        }
    }

    public getMetadata(): Auth.OAuth.MetadataAction.Result {
        this.discovery ??= this.discover().catch((error: unknown) => {
            this.discovery = undefined;
            throw error;
        });
        return this.discovery;
    }

    public async discover(): Auth.OAuth.Discover.Result {
        const response = await fetch(new URL("/.well-known/openid-configuration", process.env.OAUTH_ISSUER), {
            signal: AbortSignal.timeout(Number(process.env.AUTH_REQUEST_TIMEOUT_MS)),
        });
        if (response.ok) {
            const metadata = OAuthSchema.metadata.parse(await response.json());
            const issuer = new URL(process.env.OAUTH_ISSUER);
            const endpoints = [
                metadata.authorization_endpoint,
                metadata.revocation_endpoint,
                metadata.token_endpoint,
                metadata.jwks_uri,
            ];
            const trusted = endpoints.every((endpoint) => new URL(endpoint).origin === issuer.origin);

            if (metadata.issuer === process.env.OAUTH_ISSUER && trusted) {
                return metadata;
            } else {
                throw new Error("Discovery metadata does not match the configured issuer");
            }
        } else {
            throw new Error(`Discovery failed: HTTP ${response.status}`);
        }
    }

    public async requestToken(props: Auth.OAuth.RequestToken.Props): Auth.OAuth.RequestToken.Result {
        const metadata = await this.getMetadata();
        const response = await fetch(metadata.token_endpoint, {
            method: "POST",
            body: new URLSearchParams({ client_id: process.env.OAUTH_CLIENT_ID, ...props }),
            signal: AbortSignal.timeout(Number(process.env.AUTH_REQUEST_TIMEOUT_MS)),
            cache: "no-store",
        });
        const body: unknown = await response.json();

        if (response.ok) {
            const tokens = OAuthSchema.tokens.parse(body);
            const claims = OAuthSchema.claims.parse(decodeJwt(tokens.access_token));
            const expectedClient = claims.client_id === process.env.OAUTH_CLIENT_ID;
            const expectedIssuer = claims.iss === process.env.OAUTH_ISSUER;
            const active = claims.exp > Date.now() / 1e3;

            if (expectedIssuer && expectedClient && active) {
                return { tokens, claims };
            } else {
                throw new Error("The access token does not match the client");
            }
        } else {
            const parsed = OAuthSchema.error.safeParse(body);
            throw new Error(parsed.success ? parsed.data.error : `Token endpoint failed: HTTP ${response.status}`);
        }
    }

    public async validateIdentity(props: Auth.OAuth.ValidateIdentity.Props): Auth.OAuth.ValidateIdentity.Result {
        const metadata = await this.getMetadata();
        this.keys ??= createRemoteJWKSet(new URL(metadata.jwks_uri), {
            timeoutDuration: Number(process.env.AUTH_REQUEST_TIMEOUT_MS),
        });

        const { payload } = await jwtVerify(props.token, this.keys, {
            issuer: metadata.issuer,
            audience: process.env.OAUTH_CLIENT_ID,
            algorithms: metadata.id_token_signing_alg_values_supported,
            requiredClaims: ["sub", "iat", "exp", "nonce", "sid"],
        });

        const claims = OAuthSchema.idClaims.parse(payload);
        const partyMatches = claims.azp === undefined || claims.azp === process.env.OAUTH_CLIENT_ID;
        const multipleAudiences = Array.isArray(payload.aud) && payload.aud.length > 1;
        const audienceTrusted = multipleAudiences === false || claims.azp === process.env.OAUTH_CLIENT_ID;
        const issued = claims.iat * 1e3 <= Date.now() + Number(process.env.AUTH_IAT_TOLERANCE_MS);
        const requestMatches = claims.nonce === props.nonce && claims.sid === props.session;

        if (partyMatches && audienceTrusted && issued && requestMatches) {
            if (claims.at_hash) {
                const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(props.accessToken));
                const hash = base64url.encode(new Uint8Array(digest).slice(0, 16));
                if (claims.at_hash !== hash) {
                    throw new Error("The ID token does not match the access token");
                }
            }
        } else {
            throw new Error("The ID token does not match the authorization request");
        }
    }
}

export const OAuthEngine: Auth.OAuth.PublicContract = OAuthFlowEngine.instance;
