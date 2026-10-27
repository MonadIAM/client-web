import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~shared/notifications";
import { useLogout } from "~features/authentication";
import { useSession } from "~shared/auth";

import { sessionsQueryKey } from "./use-sessions.query";
import { SessionsManager } from "./sessions.manager";
import { SessionRevokeMode } from "./enums";

export function useSessionRevoke({ onRevoked }: Sessions.Revoke.Props) {
    const { t } = useTranslation();
    const session = useSession();
    const queryClient = useQueryClient();
    const { logout } = useLogout();

    const queryKey = [...sessionsQueryKey, session.revision, session.claims?.sid ?? ""];

    return useMutation({
        mutationFn: (target: Sessions.Revoke.Target) => {
            if (target.mode === SessionRevokeMode.ALL) {
                return SessionsManager.revokeAll();
            }

            return SessionsManager.revoke({ sessions: [target.session.id] });
        },

        onSuccess: async (_, target) => {
            await queryClient.cancelQueries({ queryKey });

            queryClient.setQueryData<Sessions.Session[]>(queryKey, (current) =>
                target.mode === SessionRevokeMode.ALL ? [] : current?.filter((item) => item.id !== target.session.id),
            );

            NotificationManager.success({
                title:
                    target.mode === SessionRevokeMode.ALL ? t("sessions.revokedAll") : t("sessions.revoked", { count: 1 }),
            });

            onRevoked();

            if (target.mode === SessionRevokeMode.ALL || target.session.id === session.claims?.sid) {
                await logout();
            } else {
                void queryClient.invalidateQueries({ queryKey });
            }
        },

        onError: (cause) => NotificationManager.error({ cause }),
    });
}
