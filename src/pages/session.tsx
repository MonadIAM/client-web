import { Button, Spinner } from "@monadiam/ui-kit";
import { useNavigate } from "react-router";
import { useState, JSX } from "react";

import { AuthWorkerClient, usePermission, useSession } from "~auth";
import { NotificationManager } from "~common/notifications";

export function Session(): JSX.Element {
    const navigate = useNavigate();
    const session = useSession();
    const permissions = usePermission();
    const [pending, setPending] = useState(false);

    async function logout(): Promise<void> {
        setPending(true);
        try {
            await AuthWorkerClient.logout();
            void navigate("/login", { replace: true });
        } catch (cause) {
            NotificationManager.error({ cause, title: "Sign out failed" });
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="mx-auto my-16 grid w-full max-w-lg gap-6 px-6">
            <h1 className="text-2xl font-semibold">MonadIAM</h1>
            <h2 className="text-lg font-medium">Current session</h2>
            <dl className="grid gap-2 text-sm [&_dt]:text-muted-foreground [&_dd]:mb-2 [&_dd]:wrap-anywhere">
                <dt>Account</dt>
                <dd>{session.claims?.sub}</dd>
                <dt>Session</dt>
                <dd>{session.claims?.sid}</dd>
                <dt>Authentication context</dt>
                <dd>{session.claims?.acr}</dd>
                <dt>Own permissions</dt>
                <dd>
                    {permissions.isSuccess ? (
                        Object.keys(permissions.data.data).length
                    ) : permissions.isError ? (
                        "—"
                    ) : (
                        <Spinner variant="inline" className="text-primary" />
                    )}
                </dd>
            </dl>
            <Button loading={pending} onClick={() => void logout()}>
                Sign out
            </Button>
        </main>
    );
}
