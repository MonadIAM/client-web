import { ButtonVariant, FormDirection, TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { Button, Flex, Form, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { FederatedProvider } from "~shared/auth/federated";

import { useSocialAuth } from "../../model/federated";
import { socialStyles } from "./styles";

export function SocialAuth({ authorizationRequest, onPendingChange, disabled }: Signin.Social.Props) {
    const { t } = useTranslation();
    const { pending, authorize } = useSocialAuth({ authorizationRequest, onPendingChange, disabled });

    return (
        <Flex.Col gap="0.75rem" className={socialStyles.root}>
            <Text.P size={TextSize.XS} tone={TextTone.MUTED} className={socialStyles.separator}>
                {t("social.or")}
            </Text.P>
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
