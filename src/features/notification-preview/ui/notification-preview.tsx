import { Button, Popover, Flex, Text, List } from "@monadiam/ui-kit";
import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { BellIcon, GearIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useState } from "react";

import { useNotificationPreview, useUnreadNotificationCount } from "../model/use-notification-preview";
import { useNotificationStream } from "../model/use-notification-stream";
import { NotificationPreviewItem } from "./notification-preview-item";
import { previewStyles } from "./styles";

export function NotificationPreview() {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const query = useNotificationPreview(open);
    const unreadQuery = useUnreadNotificationCount();
    const stream = useNotificationStream();
    const unreadCount = unreadQuery.data;
    const items = query.data?.pages.flatMap((page) => page.data) ?? [];
    const dateFormat = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
        dateStyle: "short",
        timeStyle: "short",
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger
                render={<Button variant={ButtonVariant.GHOST} size={ButtonSize.ICON} />}
                className={previewStyles.trigger}
                aria-label={
                    unreadCount === undefined
                        ? t("notificationPreview.title")
                        : t("notificationPreview.unreadCount", {
                              count: unreadCount,
                          })
                }>
                <BellIcon aria-hidden="true" />
                {unreadCount !== undefined && unreadCount > 0 && (
                    <Text.Span className={previewStyles.badge} aria-hidden="true">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </Text.Span>
                )}
            </Popover.Trigger>
            <Popover.Content className={previewStyles.panel}>
                <Flex.Row className={previewStyles.header}>
                    <Popover.Title className={previewStyles.title}>{t("notificationPreview.title")}</Popover.Title>
                    <Button
                        render={<Link to="/profile/notifications" />}
                        nativeButton={false}
                        variant={ButtonVariant.GHOST}
                        size={ButtonSize.ICON_SMALL}
                        aria-label={t("notificationSettings.title")}
                        onClick={() => setOpen(false)}>
                        <GearIcon aria-hidden="true" />
                    </Button>
                </Flex.Row>
                {stream.isError && (
                    <Flex.Row role="alert" className={previewStyles.countError}>
                        <Text.Span>{t("notificationPreview.countError")}</Text.Span>
                        <Button variant={ButtonVariant.OUTLINE} size={ButtonSize.SMALL} onClick={stream.retry}>
                            {t("common.retry")}
                        </Button>
                    </Flex.Row>
                )}
                {items.length === 0 && !query.isPending && !query.isError ? (
                    <Flex.Col className={previewStyles.state}>
                        <BellIcon className="size-6" aria-hidden="true" />
                        <Text.Span>{t("notificationPreview.empty")}</Text.Span>
                    </Flex.Col>
                ) : (
                    <List.Custom
                        aria-label={t("notificationPreview.title")}
                        items={items}
                        maxHeight={384}
                        estimateSize={128}
                        hasMore={query.hasNextPage && !query.isError}
                        loading={query.isFetching}
                        onEndReached={() => void query.fetchNextPage({ cancelRefetch: false })}
                        renderItem={(item) => (
                            <NotificationPreviewItem item={item} date={dateFormat.format(new Date(item.createdAt))} />
                        )}
                    />
                )}
                {query.isError && (
                    <Flex.Col role="alert" className={previewStyles.state}>
                        <Text.Span>{t("notificationPreview.error")}</Text.Span>
                        <Button
                            variant={ButtonVariant.OUTLINE}
                            size={ButtonSize.SMALL}
                            disabled={query.isFetching}
                            onClick={() => void (query.isFetchNextPageError ? query.fetchNextPage() : query.refetch())}>
                            {t("common.retry")}
                        </Button>
                    </Flex.Col>
                )}
                <Flex.Row className={previewStyles.footer}>
                    <Button variant={ButtonVariant.OUTLINE} className="w-full" disabled>
                        {t("notificationPreview.all")}
                    </Button>
                </Flex.Row>
            </Popover.Content>
        </Popover>
    );
}
