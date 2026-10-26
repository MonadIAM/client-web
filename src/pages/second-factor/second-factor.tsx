import { Button, Field, Form } from "@monadiam/ui-kit";
import { Link, useSearchParams } from "react-router";
import { FieldType } from "@monadiam/ui-kit/enums";
import { useForm } from "@tanstack/react-form";
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

    return (
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{t("secondFactor.title")}</h1>
                    <p className={pageStyles.description}>{t("secondFactor.description")}</p>
                </header>
                <div className={pageStyles.panel}>
                    <Form form={form} aria-label={t("secondFactor.title")}>
                        {({ isSubmitting }) => (
                            <>
                                <form.Field
                                    name="code"
                                    validators={{ onChange: IdentitySchemas.zAuthnVerifySecondFactorBody.shape.code }}>
                                    {(field) => (
                                        <Field
                                            field={field}
                                            type={FieldType.CODE}
                                            label={t("auth.code")}
                                            invalidMessage={t("validation.invalid")}
                                            autoComplete="one-time-code"
                                            required
                                        />
                                    )}
                                </form.Field>
                                <Form.Actions>
                                    <Button type="submit" loading={isSubmitting}>
                                        {t("secondFactor.submit")}
                                    </Button>
                                </Form.Actions>
                                <Form.Links>
                                    <Link to={{ pathname: "/signin/second-factor/reset", search }}>
                                        {t("secondFactor.lostAccess")}
                                    </Link>
                                </Form.Links>
                            </>
                        )}
                    </Form>
                </div>
                <Form.Links className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </Form.Links>
            </div>
        </section>
    );
}
