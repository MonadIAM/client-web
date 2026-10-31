import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { Button, DropdownMenu } from "@monadiam/ui-kit";
import { MoreIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";

import { useSecondFactorRemove } from "../../model/second-factors/use-second-factor-remove";
import { securityStyles } from "../security/styles";

export function SecondFactorActions({ factor, onVerify, onRemove }: SecondFactors.Actions.Props) {
    const { t } = useTranslation();
    const remove = useSecondFactorRemove();

    const handleRemove = () => {
        if (factor.confirmedAt) {
            onRemove();
        } else if (!remove.isPending) {
            remove.mutate({ factor: factor.id, confirmed: false });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger
                render={<Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SMALL} />}
                disabled={remove.isPending}
                aria-label={t("secondFactors.actions", { name: factor.name ?? t("secondFactors.unnamed") })}>
                <MoreIcon aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className={securityStyles.menu}>
                <DropdownMenu.Item disabled={remove.isPending || Boolean(factor.confirmedAt)} onClick={onVerify}>
                    {t("identifiers.verify")}
                </DropdownMenu.Item>
                <DropdownMenu.Item destructive disabled={remove.isPending} onClick={handleRemove}>
                    {t("common.delete")}
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    );
}
