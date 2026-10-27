import { Button, Field, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { IdentitySchemas } from "~shared/api/schemas";

import { useSecondFactorForm } from "../../model/second-factor";

export function SecondFactorForm({ authorizationRequest }: Authentication.Form.Props) {
    const { t } = useTranslation();
    const search = authorizationRequest ? `?${new URLSearchParams({ authorizationRequest })}` : "";
    const { form, isSubmitting } = useSecondFactorForm({ authorizationRequest });

    return (
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
    );
}
