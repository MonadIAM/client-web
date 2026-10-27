import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@monadiam/ui-kit";

import { FederatedProvider } from "~shared/auth/federated/enums";
import { IdentifierType } from "~shared/api/generated/identity";

import { identifierStyles } from "./styles";

export function IdentifierContent({ identifier }: Identifiers.Content.Props) {
    const { t } = useTranslation();

    const type = t(`identifiers.${identifier.type}`);
    const provider =
        identifier.provider === FederatedProvider.GITHUB || identifier.provider === FederatedProvider.GOOGLE
            ? t(`identifiers.providers.${identifier.provider}`)
            : identifier.provider;

    return (
        <Flex.Col gap="0.25rem" className={identifierStyles.content}>
            <Text.Span className={identifierStyles.identity}>{identifier.identity}</Text.Span>
            <Text.Span size={TextSize.XS} tone={TextTone.MUTED}>
                {identifier.type === IdentifierType.OAUTH && provider ? `${type} · ${provider}` : type}
            </Text.Span>
        </Flex.Col>
    );
}
