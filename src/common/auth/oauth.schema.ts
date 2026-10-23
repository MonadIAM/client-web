import { z } from "zod";

import { Identity } from "~api/schemas";

export abstract class OAuthSchema {
    private constructor() {}

    public static readonly error = Identity.zOAuthErrorResponseBody.pick({ error: true });

    public static readonly metadata = Identity.zOpenIdConfiguration;

    public static readonly tokens = z.object({
        access_token: z.string().min(1),
        refresh_token: z.string().min(1),
        token_type: z.string().refine((value) => value.toLowerCase() === "bearer"),
        expires_in: z.number().positive(),
        id_token: z.string().optional(),
    });

    public static readonly claims = z.object({
        iss: z.string(),
        sub: z.string(),
        sid: z.string(),
        jti: z.string(),
        aud: z.union([z.string(), z.array(z.string())]),
        iat: z.number(),
        exp: z.number(),
        client_id: z.string(),
        auth_time: z.number(),
        acr: z.string(),
        scope: z.string().optional(),
        realms: z.array(z.string()),
    });

    public static readonly idClaims = z.object({
        sub: z.string(),
        iat: z.number(),
        nonce: z.string(),
        sid: z.string(),
        azp: z.string().optional(),
        at_hash: z.string().optional(),
    });

    public static readonly identity = z.object({
        tokens: this.tokens,
        claims: this.claims,
    });

    public static readonly stored = z.object({
        revision: z.string(),
        identity: this.identity.nullable(),
        completedState: z.string().optional(),
    });

    public static readonly transaction = z.object({
        state: z.string(),
        nonce: z.string(),
        verifier: z.string(),
        revision: z.string(),
        createdAt: z.number(),
    });

    public static readonly authentication = z.object({
        authorizationUrl: z.url().optional(),
    });

    public static readonly snapshot = z.object({
        status: z.enum(["initializing", "anonymous", "authenticated", "unavailable"]),
        revision: z.string(),
        claims: this.claims.nullable(),
        error: z.string().optional(),
    });

    public static readonly credential = z.object({
        token: z.string(),
        revision: z.string(),
    });
}
