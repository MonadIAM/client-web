import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { NotificationManager } from "~shared/notifications";
import { FederatedManager } from "~shared/auth";

export function useFederatedCallback() {
    const navigate = useNavigate();
    const [address] = useState(() => location.href);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        void FederatedManager.complete({ address }).then(
            (result) => {
                if (active) {
                    location.replace(result.authorizationUrl);
                }
            },
            (cause: unknown) => {
                if (active) {
                    NotificationManager.error({ cause });
                    setFailed(true);
                    navigate("/auth/federated/callback", { replace: true });
                }
            },
        );

        return () => {
            active = false;
        };
    }, [address, navigate]);

    return { failed };
}
