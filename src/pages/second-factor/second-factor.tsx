import { Text, Flex, Button, Field, Form, useForm, useSelector, Container } from "@monadiam/ui-kit";
import { TextTone, FlexAlignment, FlexJustification } from "@monadiam/ui-kit/enums";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { IdentitySchemas } from "~api/schemas";
import { useAuthentication } from "~auth";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

import { pageStyles } from "./styles";

export function SecondFactor() {
    const { t } = useTranslation();
    const [parameters] = useSearchParams();
    const continueAuthentication = useAuthentication();

    const authorizationRequest = parameters.get("authorizationRequest");
    const search = authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "";

    const form = useForm({
        defaultValues: { code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await IdentitySDK.authnControllerVerifySecondFactor({
                    axios: API.identityPublic,
                    body: value,
                    throwOnError: true,
                });
                await continueAuthentication({
                    response: response.data,
                    authorizationRequest,
                });
                formApi.reset();
            } catch (cause) {
                const fields = getValidationErrors({ cause, fields: ["code"] });
                if (fields) {
                    formApi.setErrorMap({ onSubmit: { fields } });
                } else {
                    NotificationManager.error({ cause });
                }
            }
        },
    });

    const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

    return (
        <Flex.Col
            render={<section />}
            align={FlexAlignment.CENTER}
            justify={FlexJustification.CENTER}
            className={pageStyles.auth}>
            <Flex.Col className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <Text.H1>{t("secondFactor.title")}</Text.H1>
                    <Text.P tone={TextTone.MUTED}>{t("secondFactor.description")}</Text.P>
                </header>
                <Container render={<Flex.Col gap="1.25rem" />}>
                    <Form form={form} aria-label={t("secondFactor.title")}>
                        <Form.Fields>
                            <Field.Code
                                form={form}
                                name="code"
                                length={6}
                                validators={{ onChange: IdentitySchemas.zAuthnVerifySecondFactorBody.shape.code }}
                                label={t("auth.code")}
                                invalidMessage={t("validation.invalid")}
                                autoComplete="one-time-code"
                                required
                            />
                        </Form.Fields>
                        <Form.Actions>
                            <Button type="submit" loading={isSubmitting}>
                                {t("secondFactor.submit")}
                            </Button>
                        </Form.Actions>
                        <Form.Links>
                            <Link
                                to={{
                                    pathname: "/signin/second-factor/reset",
                                    search,
                                }}>
                                {t("secondFactor.lostAccess")}
                            </Link>
                        </Form.Links>
                    </Form>
                </Container>
                <Flex.Col render={<footer />} gap="0.25rem" className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Flex.Col>
            </Flex.Col>
        </Flex.Col>
    );
}
