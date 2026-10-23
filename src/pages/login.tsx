import { Button, Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, Input } from "@monadiam/ui-kit";
import { JSX, use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { OAuthSchema } from "~auth/oauth.schema";
import { AuthClient, useSession } from "~auth";
import { Identity } from "~api/sdk";
import { API } from "~api";

export function Login(): JSX.Element {
    const session = useSession();
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState(session.error ?? "");
    const redirecting = useRef(false);

    const [parameters] = useSearchParams();
    const authorizationRequest = parameters.get("authorizationRequest");
    const missingRequest = authorizationRequest === null || authorizationRequest === "";
    const available = session.status === "anonymous" || session.status === "unavailable";
    const retryAllowed = session.error === undefined || attempt > 0;
    const shouldAuthorize = missingRequest && available && retryAllowed;
    const authorization = shouldAuthorize ? use(AuthClient.authorize()) : undefined;

    useEffect(() => {
        if (authorization?.url && redirecting.current === false) {
            redirecting.current = true;
            location.replace(authorization.url);
        }
    }, [authorization]);

    const form = useForm({
        defaultValues: { identifier: "", password: "" },
        onSubmit: async ({ value, formApi }) => {
            setError("");
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
                setError(cause instanceof Error ? cause.message : "Authentication failed");
            }
        },
    });

    async function authenticate(
        values: Pick<API.Identity.AuthnPasswordBody, "identifier" | "password">,
    ): Promise<Auth.OAuth.Authentication> {
        if (authorizationRequest) {
            const response = await Identity.authnControllerPassword({
                axios: API.identityPublic,
                body: {
                    identifier: values.identifier,
                    password: values.password,
                    authorizationRequest,
                },
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
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <form.Subscribe selector={(state) => state.isSubmitting}>
                        {(isSubmitting) => (
                            <FieldSet disabled={isSubmitting}>
                                <FieldLegend>Sign in</FieldLegend>
                                <FieldGroup>
                                    <form.Field
                                        name="identifier"
                                        validators={{ onChange: z.string().min(1, "Enter your identifier") }}>
                                        {(field) => (
                                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                                <FieldLabel htmlFor={field.name}>Identifier</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    autoComplete="username"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    aria-invalid={field.state.meta.errors.length > 0}
                                                    aria-describedby={`${field.name}-error`}
                                                    required
                                                />
                                                <FieldError id={`${field.name}-error`}>
                                                    {field.state.meta.errors.map((issue) => issue?.message).join(" ")}
                                                </FieldError>
                                            </Field>
                                        )}
                                    </form.Field>
                                    <form.Field
                                        name="password"
                                        validators={{ onChange: z.string().min(1, "Enter your password") }}>
                                        {(field) => (
                                            <Field data-invalid={field.state.meta.errors.length > 0}>
                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="password"
                                                    autoComplete="current-password"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(event) => field.handleChange(event.target.value)}
                                                    aria-invalid={field.state.meta.errors.length > 0}
                                                    aria-describedby={`${field.name}-error`}
                                                    required
                                                />
                                                <FieldError id={`${field.name}-error`}>
                                                    {field.state.meta.errors.map((issue) => issue?.message).join(" ")}
                                                </FieldError>
                                            </Field>
                                        )}
                                    </form.Field>
                                    <Button type="submit" loading={isSubmitting}>
                                        Sign in
                                    </Button>
                                </FieldGroup>
                            </FieldSet>
                        )}
                    </form.Subscribe>
                </form>
            ) : error || authorization?.error ? (
                <Button
                    onClick={() => {
                        setError("");
                        AuthClient.retryAuthorization();
                        setAttempt((value) => value + 1);
                    }}>
                    Retry
                </Button>
            ) : null}
            {(error || authorization?.error) && <FieldError>{error || authorization?.error}</FieldError>}
        </main>
    );
}
