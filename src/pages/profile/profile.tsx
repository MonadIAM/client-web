import { Button, Field, Form, useForm } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
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
                    <Form.Fields>
                        <Field.Text
                            form={form}
                            name="account"
                            className={pageStyles.identifier}
                            label={t("profile.account")}
                            readOnly
                        />
                        <Field.Text
                            form={form}
                            name="session"
                            className={pageStyles.identifier}
                            label={t("profile.session")}
                            readOnly
                        />
                        <Field.Text form={form} name="context" label={t("profile.context")} readOnly />
                        <Field.Text
                            form={form}
                            name="permissions"
                            label={t("profile.permissions")}
                            aria-busy={permissions.isPending}
                            readOnly
                        />
                    </Form.Fields>
                </Form>
                <div className={pageStyles.profileActions}>
                    <Button variant={ButtonVariant.OUTLINE} loading={pending} onClick={() => void logout()}>
                        {t("auth.signout")}
                    </Button>
                </div>
            </div>
        </section>
    );
}
