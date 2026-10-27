import { useNavigate } from "react-router";

import { parseAuthentication } from "~shared/auth";

export function useAuthentication(): Authentication.Continue.Signature {
    const navigate = useNavigate();

    return async ({ response, authorizationRequest }) => {
        const result = parseAuthentication(response);
        if (result.requires2FA) {
            await navigate({
                pathname: "/signin/second-factor",
                search: authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "",
            });
        } else if (result.authorizationUrl) {
            location.assign(result.authorizationUrl);
        }
    };
}
