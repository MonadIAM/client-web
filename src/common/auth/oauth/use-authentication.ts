import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { OAuthSchema } from "./oauth.schema";

export function useAuthentication(): Auth.OAuth.UseAuthentication.Result {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return async ({ response, authorizationRequest }: Auth.OAuth.Continue.Props): Auth.OAuth.Continue.Result => {
        const result = OAuthSchema.authentication.parse(response);
        if (result.requires2FA) {
            await navigate({
                pathname: "/signin/second-factor",
                search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
            });
        } else if (result.authorizationUrl) {
            const callback = new URL(result.authorizationUrl);
            const expected = new URL(process.env.OAUTH_REDIRECT_URI);
            if (callback.origin === expected.origin && callback.pathname === expected.pathname) {
                location.assign(callback.href);
            } else {
                throw new Error(t("auth.invalidCallback"));
            }
        } else {
            throw new Error(t("auth.nextStepMissing"));
        }
    };
}
