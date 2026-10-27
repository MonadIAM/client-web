import { IdentitySchemas } from "~shared/api/schemas";

export abstract class AccountSchema {
    private constructor() {}

    public static readonly details = IdentitySchemas.zAccount
        .pick({ id: true, subject: true, status: true, profile: true, createdAt: true, updatedAt: true })
        .extend({
            profile: IdentitySchemas.zProfile
                .extend({
                    pictureUrl: IdentitySchemas.zProfile.shape.pictureUrl
                        .unwrap()
                        .nullable()
                        .transform((value) => value ?? undefined)
                        .optional(),
                    locale: IdentitySchemas.zProfile.shape.locale
                        .unwrap()
                        .nullable()
                        .transform((value) => value ?? undefined)
                        .optional(),
                    timeZone: IdentitySchemas.zProfile.shape.timeZone
                        .unwrap()
                        .nullable()
                        .transform((value) => value ?? undefined)
                        .optional(),
                    updatedAt: IdentitySchemas.zProfile.shape.updatedAt
                        .unwrap()
                        .nullable()
                        .transform((value) => (value === null ? undefined : new Date(value)))
                        .optional(),
                })
                .optional(),
            createdAt: IdentitySchemas.zAccount.shape.createdAt.transform((value) => new Date(value)),
            updatedAt: IdentitySchemas.zAccount.shape.updatedAt
                .unwrap()
                .nullable()
                .transform((value) => (value === null ? undefined : new Date(value)))
                .optional(),
        });
}
