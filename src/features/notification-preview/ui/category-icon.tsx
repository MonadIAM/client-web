import { FileIcon, GearIcon, PeopleIcon, ShieldLockIcon, CheckIcon } from "@monadiam/ui-kit/icons";
import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { Button, Flex } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { NotificationCategory } from "~shared/api/generated/notification";

import { categoryIconStyles } from "./styles";

const categoryIcons = {
    [NotificationCategory.SECURITY]: ShieldLockIcon,
    [NotificationCategory.INVITES]: PeopleIcon,
    [NotificationCategory.SYSTEM]: GearIcon,
    [NotificationCategory.OTHER]: FileIcon,
};

export function NotificationCategoryIcon({
    category,
    active = true,
    disabled = false,
    onRead,
}: NotificationPreviewView.CategoryIcon.Props) {
    const { t } = useTranslation();
    const Icon = categoryIcons[category];

    if (active && onRead) {
        return (
            <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.ICON}
                className={`${categoryIconStyles.root} ${categoryIconStyles.action}`}
                data-active={active}
                aria-label={t("notificationPreview.markRead")}
                title={t("notificationPreview.markRead")}
                disabled={disabled}
                onClick={onRead}>
                <Icon className={categoryIconStyles.category} aria-hidden="true" />
                <CheckIcon className={categoryIconStyles.read} aria-hidden="true" />
            </Button>
        );
    } else {
        return (
            <Flex.Row className={categoryIconStyles.root} data-active={active}>
                <Icon aria-hidden="true" />
            </Flex.Row>
        );
    }
}
