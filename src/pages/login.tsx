import { Button, Field, Form } from "@monadiam/ui-kit";
import { JSX, use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { NotificationManager } from "~common/notifications";
import { AuthWorkerClient, useSession } from "~auth";
import { OAuthSchema } from "~auth/oauth.schema";
import { Identity } from "~api/sdk";
import { API } from "~api";

export function Login(): JSX.Element {
    const session = useSession();
    const [attempt, setAttempt] = useState(0);
    const redirecting = useRef(false);

    const [parameters] = useSearchParams();
    const authorizationRequest = parameters.get("authorizationRequest");
    const available = session.status === "anonymous" || session.status === "unavailable";
    const retryAllowed = session.error === undefined || attempt > 0;
    const shouldAuthorize = !authorizationRequest && available && retryAllowed;
    const authorization = shouldAuthorize ? use(AuthWorkerClient.authorize()) : undefined;

    useEffect(() => {
        if (authorization?.url && redirecting.current === false) {
            redirecting.current = true;
            location.replace(authorization.url);
        }
    }, [authorization]);

    const form = useForm({
        defaultValues: { identifier: "", password: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const result = await authenticate(value);
                if (result.authorizationUrl) {
                    const callback = new URL(result.authorizationUrl);
                    const expected = new URL(process.env.OAUTH_REDIRECT_URI);
                    if (callback.origin === expected.origin && callback.pathname === expected.pathname) {
                        formApi.reset();
                        location.assign(callback.href);
                    } else {
                        throw new Error("Identity returned an unexpected callback address");
                    }
                } else {
                    throw new Error("Identity did not return the next authentication step");
                }
            } catch (cause) {
                NotificationManager.error({ cause, title: "Sign in failed" });
            }
        },
    });

    async function authenticate(
        values: Pick<API.Identity.AuthnPasswordBody, "identifier" | "password">,
    ): Promise<Auth.OAuth.Authentication> {
        if (authorizationRequest) {
            const response = await Identity.authnControllerPassword({
                axios: API.identityPublic,
                body: { identifier: values.identifier, password: values.password, authorizationRequest },
                throwOnError: true,
            });
            return OAuthSchema.authentication.parse(response.data);
        } else {
            throw new Error("Start an authorization request before signing in");
        }
    }

    return (
        <main className="mx-auto my-16 grid w-full max-w-lg gap-6 px-6">
            <h1 className="text-2xl font-semibold">MonadIAM</h1>
            {authorizationRequest ? (
                <Form form={form} legend="Sign in">
                    {({ isSubmitting }) => (
                        <>
                            <Field
                                form={form}
                                name="identifier"
                                label="Identifier"
                                autoComplete="username"
                                validators={{ onChange: z.string().min(1, "Enter your identifier") }}
                                required
                            />
                            <Field
                                form={form}
                                name="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                validators={{ onChange: z.string().min(1, "Enter your password") }}
                                required
                            />
                            <Button type="submit" loading={isSubmitting}>
                                Sign in
                            </Button>
                        </>
                    )}
                </Form>
            ) : session.error || authorization?.error ? (
                <Button
                    onClick={() => {
                        AuthWorkerClient.retryAuthorization();
                        setAttempt((value) => value + 1);
                    }}>
                    Retry
                </Button>
            ) : null}
        </main>
    );
}
