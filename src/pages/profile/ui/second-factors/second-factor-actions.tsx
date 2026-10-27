import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { Button, DropdownMenu } from "@monadiam/ui-kit";
import { MoreIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";

import { securityStyles } from "../security/styles";

export function SecondFactorActions({ factor, onVerify, onRemove }: SecondFactors.Actions.Props) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger
                render={<Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SMALL} />}
                aria-label={t("secondFactors.actions", { name: factor.name ?? t("secondFactors.unnamed") })}>
                <MoreIcon aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className={securityStyles.menu}>
                <DropdownMenu.Item disabled={Boolean(factor.confirmedAt)} onClick={onVerify}>
                    {t("identifiers.verify")}
                </DropdownMenu.Item>
                <DropdownMenu.Item destructive onClick={onRemove}>
                    {t("common.delete")}
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    );
}
