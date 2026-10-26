import { ButtonVariant, FormDirection } from "@monadiam/ui-kit/enums";
import { Flex, Button, Form } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";

import { NotificationManager } from "~common/notifications";
import { FederatedProvider } from "~src/enums";
import { FederatedManager } from "~auth";

import { socialStyles } from "../styles";

export function SocialAuth({ authorizationRequest, onPendingChange, disabled }: Signin.Social.Props) {
    const { t } = useTranslation();
    const [pending, setPending] = useState<Auth.Federated.Provider>();
    const busy = useRef(false);

    async function authorize(provider: Auth.Federated.Provider): Promise<void> {
        if (authorizationRequest && !busy.current) {
            busy.current = true;
            setPending(provider);
            onPendingChange(true);
            try {
                await FederatedManager.authorize({ provider, authorizationRequest });
            } catch (cause) {
                NotificationManager.error({ cause });
                busy.current = false;
                setPending(undefined);
                onPendingChange(false);
            }
        }
    }

    return (
        <Flex.Col gap="0.75rem" className={socialStyles.root}>
            <p className={socialStyles.separator}>{t("social.or")}</p>
            <Form.Actions direction={FormDirection.HORIZONTAL}>
                <Button
                    type="button"
                    variant={ButtonVariant.OUTLINE}
                    className={socialStyles.button}
                    disabled={disabled || !authorizationRequest || !!pending}
                    loading={pending === FederatedProvider.GITHUB}
                    aria-label={t("social.github")}
                    onClick={() => void authorize(FederatedProvider.GITHUB)}>
                    GitHub
                </Button>
                <Button
                    type="button"
                    variant={ButtonVariant.OUTLINE}
                    className={socialStyles.button}
                    disabled={disabled || !authorizationRequest || !!pending}
                    loading={pending === FederatedProvider.GOOGLE}
                    aria-label={t("social.google")}
                    onClick={() => void authorize(FederatedProvider.GOOGLE)}>
                    Google
                </Button>
            </Form.Actions>
        </Flex.Col>
    );
}
