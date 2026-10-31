import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { Button, DropdownMenu } from "@monadiam/ui-kit";
import { MoreIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";

import { IdentifierType } from "~shared/api/generated/identity";

import { useIdentifierRemove } from "../../model/identifiers/use-identifier-remove";
import { securityStyles } from "../security/styles";

export function IdentifierActions({ identifier, onVerify, onRemove }: Identifiers.Actions.Props) {
    const { t } = useTranslation();
    const remove = useIdentifierRemove();

    const handleRemove = () => {
        if (identifier.isVerified) {
            onRemove();
        } else if (!remove.isPending) {
            remove.mutate({ identifier: identifier.id, isVerified: false });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger
                render={<Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON_SMALL} />}
                disabled={remove.isPending}
                aria-label={t("identifiers.actions", { identity: identifier.identity })}>
                <MoreIcon aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className={securityStyles.menu}>
                <DropdownMenu.Item
                    disabled={remove.isPending || identifier.isVerified || identifier.type === IdentifierType.OAUTH}
                    onClick={onVerify}>
                    {t("identifiers.verify")}
                </DropdownMenu.Item>
                <DropdownMenu.Item destructive disabled={remove.isPending} onClick={handleRemove}>
                    {t("common.delete")}
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    );
}
