import { ButtonVariant, FlexJustification, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Dialog, Flex, Text, Warning } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useSessionRevoke } from "../../model/sessions/use-session-revoke";
import { SessionRevokeMode } from "../../model/sessions/enums";
import { securityStyles } from "../security/styles";
import { SessionContent } from "./session-content";

export function SessionRevokeDialog({ target, currentId, onClose }: Sessions.Dialog.Props) {
    const { t } = useTranslation();
    const request = useSessionRevoke({ onRevoked: onClose });

    const single = target.mode === SessionRevokeMode.SINGLE ? target.session : undefined;
    const current = single?.id === currentId;
    const title = single ? t("sessions.revokeTitle") : t("sessions.revokeAllTitle");
    const description = current
        ? t("sessions.revokeCurrentDescription")
        : single
          ? t("sessions.revokeDescription")
          : t("sessions.revokeAllDescription");

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !request.isPending) {
                    onClose();
                }
            }}>
            <Dialog.Content title={title} closeLabel={t("common.close")} className={securityStyles.dialog}>
                <Flex.Col gap="1.25rem">
                    {single && (
                        <Flex.Col gap="0.5rem">
                            <SessionContent session={single} current={current} />
                            <Text.Span tone={TextTone.MUTED}>{single.ip ?? "—"}</Text.Span>
                        </Flex.Col>
                    )}
                    <Warning title={t("sessions.signInRequired")}>{description}</Warning>
                    <Flex.Row justify={FlexJustification.END} gap="0.5rem" className={securityStyles.footer}>
                        <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={request.isPending}>
                            {t("common.cancel")}
                        </Dialog.Close>
                        <Button
                            variant={ButtonVariant.DESTRUCTIVE}
                            loading={request.isPending}
                            onClick={() => request.mutate(target)}>
                            {single ? t("sessions.revoke") : t("sessions.revokeAll")}
                        </Button>
                    </Flex.Row>
                </Flex.Col>
            </Dialog.Content>
        </Dialog>
    );
}
