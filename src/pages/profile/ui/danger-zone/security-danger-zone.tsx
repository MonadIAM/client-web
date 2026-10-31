import { Button, DangerZone, Text, Flex } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";

import { RetryButton } from "~shared/ui/retry-button";

import { useSecurityQuery } from "../../model/security/use-security.query";
import { DangerZoneAction } from "../../model/danger-zone/enums";
import { SecurityDangerDialog } from "./security-danger-dialog";

export function SecurityDangerZone() {
    const { t } = useTranslation();
    const security = useSecurityQuery();
    const [action, setAction] = useState<DangerZoneAction>();

    const retry = security.isError && <RetryButton loading={security.isFetching} onClick={() => void security.refetch()} />;
    const disabled = !security.data || security.isError;

    let passwordTitle = t("auth.password");
    let passwordDescription = t("dangerZone.passwordDescription");
    let passwordAction = t("dangerZone.passwordAction");

    if (security.data) {
        passwordTitle = security.data.hasPassword ? t("dangerZone.changePassword") : t("dangerZone.setPassword");
        passwordDescription = security.data.hasPassword
            ? t("dangerZone.changePasswordDescription")
            : t("dangerZone.setPasswordDescription");
        passwordAction = security.data.hasPassword
            ? t("dangerZone.changePasswordAction")
            : t("dangerZone.setPasswordAction");
    }

    return (
        <Fragment>
            <DangerZone
                title={t("dangerZone.title")}
                actions={retry}
                items={[
                    {
                        id: "password",
                        title: passwordTitle,
                        description: passwordDescription,
                        action: (
                            <Flex.Row gap="0.5rem">
                                {security.data?.hasPassword && (
                                    <Button
                                        variant={ButtonVariant.DESTRUCTIVE}
                                        disabled={disabled}
                                        onClick={() => setAction(DangerZoneAction.RESET_PASSWORD)}>
                                        {t("dangerZone.resetPasswordAction")}
                                    </Button>
                                )}
                                <Button
                                    variant={ButtonVariant.DESTRUCTIVE}
                                    disabled={disabled}
                                    onClick={() => setAction(DangerZoneAction.PASSWORD)}>
                                    {passwordAction}
                                </Button>
                            </Flex.Row>
                        ),
                    },
                    {
                        id: "recovery-codes",
                        title: t("dangerZone.recoveryCodes"),
                        description: t("dangerZone.recoveryCodesDescription"),
                        action: (
                            <Button
                                variant={ButtonVariant.DESTRUCTIVE}
                                disabled={disabled}
                                onClick={() => setAction(DangerZoneAction.RECOVERY_CODES)}>
                                {t("dangerZone.regenerateCodesAction")}
                            </Button>
                        ),
                    },
                ]}>
                {security.isPending && <Text.P role="status">{t("common.loading")}</Text.P>}
            </DangerZone>
            {action && security.data && (
                <SecurityDangerDialog
                    action={action}
                    hasPassword={security.data.hasPassword}
                    onClose={() => setAction(undefined)}
                />
            )}
        </Fragment>
    );
}
