import { z } from "zod";

import { IdentitySchemas } from "~shared/api/schemas";

export abstract class SecuritySchema {
    private constructor() {}

    public static readonly code = z.string().regex(/^\d{6}$/u);
    public static readonly password = z.string().min(1);
    public static readonly status = IdentitySchemas.zAccountSecurity;
}
