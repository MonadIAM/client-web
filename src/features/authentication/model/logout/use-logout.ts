import { useNavigate } from "react-router";
import { useState } from "react";

import { NotificationManager } from "~shared/notifications";
import { AuthWorkerClient } from "~shared/auth";

export function useLogout() {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);

    async function logout(): Promise<void> {
        setPending(true);
        try {
            await AuthWorkerClient.logout();
            void navigate("/signin", { replace: true });
        } catch (cause) {
            NotificationManager.error({ cause });
        } finally {
            setPending(false);
        }
    }

    return { pending, logout };
}
