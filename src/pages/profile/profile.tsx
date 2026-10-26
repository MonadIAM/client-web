import { ButtonVariant, FormAlignment, FormDirection } from "@monadiam/ui-kit/enums";
import { Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router";
import { useState, JSX } from "react";

import { AuthWorkerClient, usePermission, useSession } from "~auth";
import { NotificationManager } from "~common/notifications";

import { pageStyles } from "./styles";

export function Profile(): JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const session = useSession();
    const permissions = usePermission();
    const [pending, setPending] = useState(false);

    const form = useForm({
        defaultValues: {
            account: session.claims?.sub ?? "—",
            session: session.claims?.sid ?? "—",
            context: session.claims?.acr ?? "—",
            permissions: permissions.isSuccess
                ? String(Object.keys(permissions.data.data).length)
                : permissions.isError
                  ? "—"
                  : t("common.loading"),
        },
    });

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

    return (
        <section className={pageStyles.root}>
            <header className={pageStyles.profileHeader}>
                <h1 className={pageStyles.title}>{t("profile.title")}</h1>
                <p className={pageStyles.description}>{t("profile.description")}</p>
            </header>
            <div className={pageStyles.panel}>
                <Form form={form} aria-label={t("profile.title")}>
                    <form.Field name="account">
                        {(field) => (
                            <Field field={field} className={pageStyles.identifier} label={t("profile.account")} readOnly />
                        )}
                    </form.Field>
                    <form.Field name="session">
                        {(field) => (
                            <Field field={field} className={pageStyles.identifier} label={t("profile.session")} readOnly />
                        )}
                    </form.Field>
                    <form.Field name="context">
                        {(field) => <Field field={field} label={t("profile.context")} readOnly />}
                    </form.Field>
                    <form.Field name="permissions">
                        {(field) => (
                            <Field
                                field={field}
                                label={t("profile.permissions")}
                                aria-busy={permissions.isPending}
                                readOnly
                            />
                        )}
                    </form.Field>
                </Form>
                <Form.Actions
                    direction={FormDirection.HORIZONTAL}
                    align={FormAlignment.END}
                    className={pageStyles.profileActions}>
                    <Button variant={ButtonVariant.OUTLINE} loading={pending} onClick={() => void logout()}>
                        {t("auth.signout")}
                    </Button>
                </Form.Actions>
            </div>
        </section>
    );
}
