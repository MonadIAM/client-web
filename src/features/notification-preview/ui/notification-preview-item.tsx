import { TextSize, TextTone, TextWeight, TextHyphens } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@monadiam/ui-kit";

import { useMarkNotificationRead } from "../model/use-notification-preview";
import { NotificationCategoryIcon } from "./category-icon";
import { previewStyles } from "./styles";

export function NotificationPreviewItem({ item, date }: NotificationPreviewView.Item.Props) {
    const { t, i18n } = useTranslation();
    const markRead = useMarkNotificationRead();
    const unread = Boolean(item.message && !item.message.readAt);
    const title = item.title?.trim() ? item.title : t(`notificationPreview.categories.${item.category}`);

    return (
        <Flex.Col gap="0.5rem" className={previewStyles.item}>
            <Flex.Row gap="0.75rem">
                <NotificationCategoryIcon
                    category={item.category}
                    active={unread}
                    disabled={markRead.isPending}
                    onRead={() => {
                        if (item.message && unread && !markRead.isPending) {
                            markRead.mutate(item.message.id);
                        }
                    }}
                />
                <Flex.Col className={previewStyles.content}>
                    <Text.H3
                        size={TextSize.SM}
                        weight={unread ? TextWeight.SEMIBOLD : TextWeight.REGULAR}
                        className={previewStyles.name}
                        lang={item.title?.trim() ? (item.locale ?? "") : i18n.resolvedLanguage}
                        title={title}>
                        {title}
                        {unread && (
                            <Text.Span className="sr-only" lang={i18n.resolvedLanguage}>
                                {" — "}
                                {t("notificationPreview.unread")}
                            </Text.Span>
                        )}
                    </Text.H3>
                    <Text.Time
                        size={TextSize.XS}
                        tone={TextTone.MUTED}
                        dateTime={item.createdAt}
                        className={previewStyles.date}>
                        {date}
                    </Text.Time>
                </Flex.Col>
            </Flex.Row>
            {item.body && (
                <Text.P
                    size={TextSize.SM}
                    tone={TextTone.MUTED}
                    hyphens={TextHyphens.AUTO}
                    lang={item.locale ?? ""}
                    className={previewStyles.body}>
                    {item.body}
                </Text.P>
            )}
        </Flex.Col>
    );
}
