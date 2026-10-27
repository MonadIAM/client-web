import process from "node:process";
import { z } from "zod";
import ms from "ms";

import "dotenv/config";

const interval = z
    .string()
    .min(1)
    .transform((value) => ms(value as ms.StringValue));
const duration = interval.pipe(z.number().int().nonnegative().max(2_147_483_647)).transform(String);
const timeout = interval.pipe(z.number().int().positive().max(2_147_483_647)).transform(String);
const ratio = z.string().pipe(z.coerce.number<string>().gt(0).lt(1)).transform(String);
const origin = z.url({ protocol: /^https?$/ });

export const envSchema = z.object({
    ACCESS_CONTROL_ORIGIN: origin,
    NOTIFICATION_ORIGIN: origin,
    ORGANIZATION_ORIGIN: origin,
    IDENTITY_ORIGIN: origin,
    HR_ORIGIN: origin,

    OAUTH_ISSUER: origin,
    OAUTH_CLIENT_ID: z.uuid(),
    OAUTH_SCOPE: z.string().min(1),
    OAUTH_REDIRECT_URI: origin,

    OTP_COOLDOWN: timeout,

    COPY_FEEDBACK_DURATION_MS: timeout,

    TOAST_VISIBLE_LIMIT: z.string().pipe(z.coerce.number<string>().int().positive()).transform(String),

    API_REQUEST_TIMEOUT_MS: timeout,
    AUTH_REQUEST_TIMEOUT_MS: timeout,
    AUTH_WORKER_TIMEOUT_MS: timeout,
    AUTH_REFRESH_LEEWAY_MS: duration,
    AUTH_REFRESH_LEEWAY_RATIO: ratio,
    AUTH_TRANSACTION_TTL_MS: timeout,
    AUTH_IAT_TOLERANCE_MS: duration,
    AUTH_PERMISSION_STALE_TIME_MS: duration,
    AUTH_ACCOUNT_STALE_TIME_MS: duration,
});

export const env = envSchema.parse(process.env);
