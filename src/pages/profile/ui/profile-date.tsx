import { TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@monadiam/ui-kit";

export function ProfileDate({ value }: ProfileDate.Props) {
    const { i18n } = useTranslation();

    const date = value ? new Date(value) : undefined;

    return date ? (
        <Flex.Col gap="0.25rem">
            <Text.Span>{new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "short" }).format(date)}</Text.Span>
            <Text.Span size={TextSize.XS} tone={TextTone.MUTED}>
                {new Intl.DateTimeFormat(i18n.resolvedLanguage, { timeStyle: "short" }).format(date)}
            </Text.Span>
        </Flex.Col>
    ) : (
        <Text.Span tone={TextTone.MUTED}>—</Text.Span>
    );
}
