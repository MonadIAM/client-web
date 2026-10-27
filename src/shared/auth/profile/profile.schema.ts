import { z } from "zod";

export abstract class ProfileSchema {
    private constructor() {}

    public static readonly response = z.object({ sub: z.string(), name: z.string().optional() });
}
