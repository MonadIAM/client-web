import { useTranslation } from "react-i18next";
import { useForm } from "@monadiam/ui-kit";

import { usePermission, useSession } from "~shared/auth";

export function useProfileForm() {
    const { t } = useTranslation();
    const session = useSession();
    const permissions = usePermission();

    const form = useForm({
        defaultValues: {
            account: session.claims?.sub ?? "—",
            session: session.claims?.sid ?? "—",
            context: session.claims?.acr ?? "—",
            permissions: permissions.isSuccess
                ? String(Object.keys(permissions.data.data).length)
                : permissions.isError
                  ? "—"
                  : t("common.loading"),
        },
    });

    return { form, permissions };
}
