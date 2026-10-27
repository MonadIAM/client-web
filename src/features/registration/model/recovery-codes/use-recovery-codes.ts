import { useTranslation } from "react-i18next";

import { NotificationManager } from "~shared/notifications";

export function useRecoveryCodes({ codes }: Signup.SaveRecoveryCodes.Props) {
    const { t } = useTranslation();

    async function copy(): Promise<void> {
        try {
            await navigator.clipboard.writeText(codes.join("\n"));
            NotificationManager.success({ title: t("auth.copiedCodes") });
        } catch (cause) {
            NotificationManager.error({ cause, title: t("auth.copyFailed") });
        }
    }

    return { copy };
}
