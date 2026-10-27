import { useRef, useState } from "react";

import { NotificationManager } from "~shared/notifications";
import { FederatedManager } from "~shared/auth";

export function useSocialAuth({ authorizationRequest, onPendingChange }: Signin.Social.Props) {
    const [pending, setPending] = useState<Auth.Federated.Provider>();
    const busy = useRef(false);

    async function authorize(provider: Auth.Federated.Provider): Promise<void> {
        if (authorizationRequest && !busy.current) {
            busy.current = true;
            setPending(provider);
            onPendingChange(true);
            try {
                await FederatedManager.authorize({ provider, authorizationRequest });
            } catch (cause) {
                NotificationManager.error({ cause });
                busy.current = false;
                setPending(undefined);
                onPendingChange(false);
            }
        }
    }

    return { pending, authorize };
}
