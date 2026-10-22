import process from "node:process";
import { z } from "zod";
import "dotenv/config";

const origin = z.url({ protocol: /^https?$/ });

export const envSchema = z.object({
    ACCESS_CONTROL_ORIGIN: origin,
    NOTIFICATION_ORIGIN: origin,
    ORGANIZATION_ORIGIN: origin,
    IDENTITY_ORIGIN: origin,
    HR_ORIGIN: origin,
});

envSchema.parse(process.env);
