import { Button, Form, RecoveryCodes } from "@monadiam/ui-kit";
import { ButtonVariant } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "~common/notifications";

import { pageStyles } from "../styles";

export function SaveRecoveryCodes({ codes, onComplete }: Signup.SaveRecoveryCodes.Props) {
    const { t } = useTranslation();

    async function copy(): Promise<void> {
        try {
            await navigator.clipboard.writeText(codes.join("\n"));
            NotificationManager.success({ title: t("auth.copiedCodes") });
        } catch (cause) {
            NotificationManager.error({ cause, title: t("auth.copyFailed") });
        }
    }

    return (
        <>
            <p role="status" className={pageStyles.description}>
                {t("auth.saveCodes")}
            </p>
            <RecoveryCodes codes={codes} />
            <Form.Actions>
                <Button type="button" variant={ButtonVariant.OUTLINE} onClick={() => void copy()}>
                    {t("auth.copyCodes")}
                </Button>
                <Button type="button" onClick={onComplete}>
                    {t("auth.codesSaved")}
                </Button>
            </Form.Actions>
        </>
    );
}
