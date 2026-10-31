import { Badge, Button, List, Text } from "@monadiam/ui-kit";
import { ButtonSize, ButtonVariant, BadgeTone, TextSize } from "@monadiam/ui-kit/enums";
import { CopyIcon, CheckIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";

import { useProfileCopy } from "../model/use-profile-copy";
import { pageStyles } from "./styles";

const accountStatusTones = {
    ACTIVE: BadgeTone.SUCCESS,
    PENDING: BadgeTone.WARNING,
    SUSPENDED: BadgeTone.DANGER,
    DEACTIVATED: BadgeTone.NEUTRAL,
} satisfies ProfileDetails.StatusTones;

export function ProfileAccount({ account }: ProfileDetails.Props) {
    const { t, i18n } = useTranslation();
    const { copied, copy } = useProfileCopy({ value: account.id });
    const copyLabel = copied ? t("common.copied") : t("profile.copyId");
    const CopyStatusIcon = copied ? CheckIcon : CopyIcon;

    return (
        <List
            items={[
                {
                    id: "id",
                    label: t("profile.id"),
                    content: (
                        <Text.Span size={TextSize.XS} className={pageStyles.identifier}>
                            {account.id}
                        </Text.Span>
                    ),
                    action: (
                        <Button
                            type="button"
                            variant={ButtonVariant.GHOST}
                            size={ButtonSize.ICON_EXTRA_SMALL}
                            icon={<CopyStatusIcon aria-hidden="true" className={pageStyles.copyIcon} />}
                            aria-label={copyLabel}
                            title={copyLabel}
                            onClick={() => void copy()}>
                            <Text.Span role="status" className={pageStyles.copyStatus}>
                                {copied ? t("common.copied") : ""}
                            </Text.Span>
                        </Button>
                    ),
                },
                {
                    id: "subject",
                    label: t("profile.subject"),
                    content: <Text.Span>{t(`profile.subjects.${account.subject}`)}</Text.Span>,
                },
                {
                    id: "status",
                    label: t("profile.status"),
                    content: (
                        <Badge tone={accountStatusTones[account.status]}>{t(`profile.statuses.${account.status}`)}</Badge>
                    ),
                },
                {
                    id: "created",
                    label: t("profile.createdAt"),
                    content: (
                        <Text.Span>
                            {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: account.profile?.timeZone ?? undefined,
                            }).format(account.createdAt)}
                        </Text.Span>
                    ),
                },
            ]}
        />
    );
}
