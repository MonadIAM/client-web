import { ButtonVariant, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Container, Field, Flex, Form, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { JSX } from "react";

import { useLogout } from "~features/authentication";

import { pageStyles } from "./styles";
import { useProfileForm } from "../model/use-profile.form";

export function Profile(): JSX.Element {
    const { t } = useTranslation();
    const { form, permissions } = useProfileForm();
    const { pending, logout } = useLogout();

    return (
        <section className={pageStyles.root}>
            <header className={pageStyles.profileHeader}>
                <title>{t("profile.title")}</title>
                <Text.H1>{t("profile.title")}</Text.H1>
                <Text.P tone={TextTone.MUTED}>{t("profile.description")}</Text.P>
            </header>
            <Container render={<Flex.Col gap="1.25rem" />}>
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
                <Flex.Row justify={FlexJustification.END} className={pageStyles.profileActions}>
                    <Button variant={ButtonVariant.OUTLINE} loading={pending} onClick={() => void logout()}>
                        {t("auth.signout")}
                    </Button>
                </Flex.Row>
            </Container>
        </section>
    );
}
