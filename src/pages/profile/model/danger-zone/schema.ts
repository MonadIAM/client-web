import { z } from "zod";

export abstract class DangerZoneSchema {
    private constructor() {}

    public static readonly codes = z.object({
        codes: z.array(z.string()).min(1),
    });
}
