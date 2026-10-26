import { z } from "zod";

export abstract class SignupSchema {
    private constructor() {}

    public static readonly verification = z.object({
        codes: z.array(z.string().min(1)).min(1),
    });
}
