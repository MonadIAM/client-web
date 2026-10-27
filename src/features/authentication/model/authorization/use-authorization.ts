import { useEffect, useState } from "react";

import { AuthWorkerClient, useSession } from "~shared/auth";
import { SessionStatus } from "~shared/auth/session";

export function useAuthorization({ authorizationRequest }: Authentication.Form.Props) {
    const session = useSession();
    const [attempt, setAttempt] = useState(0);
    const [authorization, setAuthorization] = useState<Auth.WorkerClient.Authorization>();

    const available = session.status === SessionStatus.ANONYMOUS || session.status === SessionStatus.UNAVAILABLE;
    const retryAllowed = session.error === undefined || attempt > 0;
    const shouldAuthorize = !authorizationRequest && available && retryAllowed;
    const preparing = shouldAuthorize && !authorization?.error;

    useEffect(() => {
        let active = true;
        if (shouldAuthorize) {
            void AuthWorkerClient.authorize().then((result) => {
                if (active) {
                    setAuthorization(result);
                    if (result.url) {
                        location.replace(result.url);
                    }
                }
            });
        }

        return () => {
            active = false;
        };
    }, [shouldAuthorize, attempt]);

    function retry(): void {
        setAuthorization(undefined);
        AuthWorkerClient.retryAuthorization();
        setAttempt((value) => value + 1);
    }

    return { preparing, retry, error: session.error ?? authorization?.error };
}
