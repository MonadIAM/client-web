import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
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
        <section className={pageStyles.auth}>
            <div className={pageStyles.authContent}>
                <header className={pageStyles.header}>
                    <h1 className={pageStyles.title}>{t("secondFactor.title")}</h1>
                    <p className={pageStyles.description}>{t("secondFactor.description")}</p>
                </header>
                <div className={pageStyles.panel}>
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
                </div>
                <footer className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </footer>
            </div>
        </section>
    );
}
