import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@monadiam/ui-kit";

import { IdentifierType } from "~shared/api/generated/identity";

import { identifierStyles } from "./styles";

export function IdentifierContent({ identifier }: Identifiers.Content.Props) {
    const { t } = useTranslation();

    return (
        <Flex.Col gap="0.25rem" className={identifierStyles.content}>
            <Text.Span className={identifierStyles.identity}>{identifier.identity}</Text.Span>
            <Text.Span size={TextSize.XS} tone={TextTone.MUTED}>
                {identifier.type === IdentifierType.EMAIL ? t("identifiers.email") : t("identifiers.phone")}
            </Text.Span>
        </Flex.Col>
    );
}
