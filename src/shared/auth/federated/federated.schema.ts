import { z } from "zod";

import { FederatedProvider } from "~shared/auth/federated/enums";

export abstract class FederatedSchema {
    private constructor() {}

    public static readonly provider = z.enum(FederatedProvider);

    public static readonly authorization = z.object({ url: z.url({ protocol: /^https$/ }) });

    public static readonly transaction = z.object({
        provider: this.provider,
        state: z.string().min(1),
        createdAt: z.number(),
    });

    public static readonly result = z.object({
        authorizationUrl: z.url(),
    });
}
