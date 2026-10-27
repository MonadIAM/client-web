import { z } from "zod";

export abstract class SecuritySchema {
    private constructor() {}

    public static readonly code = z.string().regex(/^\d{6}$/u);
    public static readonly password = z.string().min(1);
}
