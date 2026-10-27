import { i18n } from "~shared/i18n";

import { OAuthSchema } from "./oauth.schema";

export function parseAuthentication(response: unknown): Auth.OAuth.Authentication {
    const result = OAuthSchema.authentication.parse(response);
    if (!result.requires2FA) {
        if (result.authorizationUrl) {
            const callback = new URL(result.authorizationUrl);
            const expected = new URL(process.env.OAUTH_REDIRECT_URI);
            if (callback.origin !== expected.origin || callback.pathname !== expected.pathname) {
                throw new Error(i18n.t("auth.invalidCallback"));
            }
            return { ...result, authorizationUrl: callback.href };
        } else {
            throw new Error(i18n.t("auth.nextStepMissing"));
        }
    }
    return result;
}
