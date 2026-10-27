import { z } from "zod";

import { IdentitySchemas } from "~shared/api/schemas";

export abstract class IdentifierSchema {
    private constructor() {}

    public static readonly identifier = IdentitySchemas.zIdentifier
        .pick({
            id: true,
            type: true,
            identity: true,
            provider: true,
            isVerified: true,
            isPublicContact: true,
            createdAt: true,
            verifiedAt: true,
        })
        .extend({
            provider: IdentitySchemas.zIdentifier.shape.provider.nullish().transform((value) => value ?? undefined),
            verifiedAt: IdentitySchemas.zIdentifier.shape.verifiedAt
                .unwrap()
                .nullable()
                .transform((value) => value ?? undefined)
                .optional(),
        });

    public static readonly list = z.object({
        data: z.array(IdentifierSchema.identifier),
        meta: IdentitySchemas.zListMeta,
    });

    public static readonly email = z.email();
    public static readonly phone = z.string().regex(/^\+[1-9]\d{6,14}$/u);
}
