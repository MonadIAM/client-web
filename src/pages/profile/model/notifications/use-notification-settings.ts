import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { ChannelType } from "~shared/api/generated/notification";
import { IdentifierType } from "~shared/api/generated/identity";
import { NotificationManager } from "~shared/notifications";
import { SessionStatus } from "~shared/auth/session";
import { useSession } from "~shared/auth";

import { useIdentifiersQuery } from "../identifiers/use-identifiers.query";
import { NotificationSettingsManager } from "./notification-settings.manager";

export const notificationSettingsQueryKey = ["notification-settings"];

export function useNotificationSettings() {
    const session = useSession();
    const queryClient = useQueryClient();
    const queryKey = [...notificationSettingsQueryKey, session.revision];
    const onMutate = () => queryClient.cancelQueries({ queryKey });
    const onError = (cause: unknown) => NotificationManager.error({ cause });

    const identifiers = useIdentifiersQuery();
    const emails = useMemo(
        () => identifiers.data?.filter((item) => item.type === IdentifierType.EMAIL && item.isVerified) ?? [],
        [identifiers.data],
    );

    const query = useQuery({
        queryKey,
        enabled: session.status === SessionStatus.AUTHENTICATED,
        queryFn: ({ signal }) => NotificationSettingsManager.get({ signal }),
    });
    const channel = query.data?.channels.find((item) => item.type === ChannelType.EMAIL);

    const selection = useMutation({
        mutationFn: NotificationSettingsManager.selectEmail,
        onMutate,
        onSuccess: (_, input) => {
            const identifier = emails.find((item) => item.id === input.identifier);
            if (identifier) {
                queryClient.setQueryData<NotificationSettings.Data>(queryKey, (current) => {
                    if (!current) {
                        return current;
                    }

                    return {
                        ...current,
                        channels: current.channels.map((item) => {
                            if (item.type === ChannelType.EMAIL) {
                                return {
                                    ...item,
                                    sourceIdentifier: identifier.id,
                                    address: identifier.identity,
                                    isVerified: true,
                                };
                            }

                            return item;
                        }),
                    };
                });
            }
        },
    });

    const sound = useMutation({
        mutationFn: NotificationSettingsManager.toggleSound,
        onMutate,
        onSuccess: () => {
            queryClient.setQueryData<NotificationSettings.Data>(queryKey, (current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    channels: current.channels.map((item) => {
                        if (item.type === ChannelType.IN_APP) {
                            return { ...item, soundEnabled: !item.soundEnabled };
                        }

                        return item;
                    }),
                };
            });
        },
        onError,
    });
    const email = useMutation({
        mutationFn: NotificationSettingsManager.toggleEmail,
        onMutate,
        onSuccess: (_, input) => {
            queryClient.setQueryData<NotificationSettings.Data>(queryKey, (current) => {
                if (!current) {
                    return current;
                }

                const preference = current.preferences.find(
                    (item) => item.channelType === ChannelType.EMAIL && item.category === input.category,
                );

                if (preference) {
                    return {
                        ...current,
                        preferences: current.preferences.map((item) => {
                            if (item === preference) {
                                return { ...item, isDuplicationEnabled: !item.isDuplicationEnabled };
                            }

                            return item;
                        }),
                    };
                } else {
                    return {
                        ...current,
                        preferences: [
                            ...current.preferences,
                            {
                                channelType: ChannelType.EMAIL,
                                category: input.category,
                                isDuplicationEnabled: false,
                            },
                        ],
                    };
                }
            });
        },
        onError,
    });

    const disabled = query.isFetching || query.isError || sound.isPending || email.isPending;
    const hasEmail = Boolean(
        channel?.isVerified && channel.address && emails.some((item) => item.id === channel.sourceIdentifier),
    );

    return { query, sound, email, selection, identifiers, emails, channel, hasEmail, disabled };
}
