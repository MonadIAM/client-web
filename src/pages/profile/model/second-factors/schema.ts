import { z } from "zod";

export abstract class SecondFactorSchema {
    private constructor() {}

    public static readonly factor = z.object({
        id: z.uuid(),
        type: z.string(),
        name: z
            .string()
            .nullish()
            .transform((value) => value ?? undefined),
        createdAt: z.iso.datetime(),
        confirmedAt: z.iso
            .datetime()
            .nullish()
            .transform((value) => value ?? undefined),
    });

    public static readonly list = z.object({
        data: z.array(SecondFactorSchema.factor),
    });

    public static readonly setup = z.object({
        id: z.uuid(),
        uri: z.url().refine((value) => {
            const uri = new URL(value);

            return uri.protocol === "otpauth:" && uri.hostname === "totp" && Boolean(uri.searchParams.get("secret"));
        }),
    });

    public static readonly verification = z.object({
        code: z
            .string()
            .nullish()
            .transform((value) => value ?? undefined),
    });

    public static readonly name = z.string().trim().min(1).max(128);
}
