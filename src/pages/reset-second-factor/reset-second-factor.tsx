import { Button, Field, Form, useForm, useSelector } from "@monadiam/ui-kit";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~common/notifications";
import { getValidationErrors } from "~api/validation";
import { IdentitySchemas } from "~api/schemas";
import { IdentitySDK } from "~api/sdk";
import { API } from "~api";

import { pageStyles } from "./styles";

export function ResetSecondFactor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [parameters] = useSearchParams();

    const authorizationRequest = parameters.get("authorizationRequest");
    const search = authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "";

    const form = useForm({
        defaultValues: { identifier: "", code: "" },
        onSubmit: async ({ value, formApi }) => {
            try {
                const response = await IdentitySDK.secondFactorControllerReset({
                    axios: API.identityPublic,
                    body: {
                        identifier: value.identifier.trim(),
                        code: value.code.trim(),
                    },
                    throwOnError: true,
                });
                NotificationManager.response({ data: response.data });
                formApi.reset();
                await navigate({ pathname: "/signin", search });
            } catch (cause) {
                const fields = getValidationErrors({
                    cause,
                    fields: ["identifier", "code"],
                });
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
                    <h1 className={pageStyles.title}>{t("resetSecondFactor.title")}</h1>
                    <p className={pageStyles.description}>{t("resetSecondFactor.description")}</p>
                </header>
                <div className={pageStyles.panel}>
                    <Form form={form} aria-label={t("resetSecondFactor.title")}>
                        <Form.Fields>
                            <Field.Text
                                form={form}
                                name="identifier"
                                validators={{ onChange: IdentitySchemas.zSecondFactorResetBody.shape.identifier }}
                                label={t("auth.identifier")}
                                invalidMessage={t("validation.invalid")}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                            />
                            <Field.Text
                                form={form}
                                name="code"
                                validators={{ onChange: IdentitySchemas.zSecondFactorResetBody.shape.code }}
                                label={t("resetSecondFactor.masterCode")}
                                invalidMessage={t("validation.invalid")}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                            />
                        </Form.Fields>
                        <Form.Actions>
                            <Button type="submit" loading={isSubmitting}>
                                {t("resetSecondFactor.submit")}
                            </Button>
                        </Form.Actions>
                    </Form>
                </div>
                <footer className={pageStyles.footer}>
                    <Link to={{ pathname: "/signin", search }}>{t("auth.continue")}</Link>
                </footer>
            </div>
        </section>
    );
}
