import { z } from "zod";

export abstract class SecondFactorSchema {
    private constructor() {}

    public static readonly code = z.string().regex(/^\d{6}$/u);
}
