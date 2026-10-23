import { Button, FieldError, Spinner } from "@monadiam/ui-kit";
import { useState, JSX } from "react";

import { AuthClient, usePermission, useSession } from "~auth";

export function Session(): JSX.Element {
    const session = useSession();
    const permissions = usePermission();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    async function logout(): Promise<void> {
        setPending(true);
        setError("");
        try {
            await AuthClient.logout();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Sign out failed");
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
                        "Unavailable"
                    ) : (
                        <Spinner variant="inline" className="text-primary" />
                    )}
                </dd>
            </dl>
            <Button loading={pending} onClick={() => void logout()}>
                Sign out
            </Button>
            {(error || session.error) && <FieldError>{error || session.error}</FieldError>}
        </main>
    );
}
