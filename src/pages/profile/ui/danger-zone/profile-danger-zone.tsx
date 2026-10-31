import { Button, DangerZone, Dialog } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Fragment, useState } from "react";

import { NotificationManager } from "~shared/notifications";
import { AuthWorkerClient } from "~shared/auth";

import { DangerZoneManager } from "../../model/danger-zone/danger-zone.manager";
import { dangerZoneMutationKey } from "../../model/danger-zone/constants";
import { SecurityActionForm } from "../security/security-action-form";
import { securityStyles } from "../security/styles";

export function ProfileDangerZone({ disabled }: ProfileDangerZone.Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const pending = useIsMutating({ mutationKey: dangerZoneMutationKey }) > 0;

    async function deactivate(): Promise<void> {
        await DangerZoneManager.deactivate();
        await AuthWorkerClient.logout();
    }

    return (
        <Fragment>
            <DangerZone
                title={t("dangerZone.title")}
                items={[
                    {
                        id: "deactivate",
                        title: t("dangerZone.deactivate"),
                        description: t("dangerZone.deactivateDescription"),
                        action: (
                            <Button variant={ButtonVariant.DESTRUCTIVE} disabled={disabled} onClick={() => setOpen(true)}>
                                {t("dangerZone.deactivateAction")}
                            </Button>
                        ),
                    },
                ]}
            />
            {open && (
                <Dialog
                    open
                    onOpenChange={(value) => {
                        if (!pending) {
                            setOpen(value);
                        }
                    }}>
                    <Dialog.Content
                        title={t("dangerZone.deactivate")}
                        closeLabel={t("common.close")}
                        showClose={!pending}
                        className={securityStyles.dialog}>
                        <SecurityActionForm
                            title={t("dangerZone.deactivate")}
                            subject={t("dangerZone.deactivateWarning")}
                            description={t("dangerZone.deactivateConfirmation")}
                            mutationKey={dangerZoneMutationKey}
                            action={deactivate}
                            onComplete={() => {
                                NotificationManager.success({
                                    title: t("dangerZone.deactivated"),
                                });
                                void navigate("/signin", { replace: true });
                            }}
                        />
                    </Dialog.Content>
                </Dialog>
            )}
        </Fragment>
    );
}
