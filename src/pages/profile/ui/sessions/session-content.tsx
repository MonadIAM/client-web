import { BadgeTone, FlexAlignment, TextSize, TextTone } from "@monadiam/ui-kit/enums";
import { Badge, Flex, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import Bowser from "bowser";

import { sessionStyles } from "./styles";

export function SessionContent({ session, current = false }: Sessions.Content.Props) {
    const { t } = useTranslation();

    const agent = session.userAgent ? Bowser.parse(session.userAgent) : undefined;
    const browser = [agent?.browser.name, agent?.browser.version].filter(Boolean).join(" ");

    return (
        <Flex.Col gap="0.25rem" className={sessionStyles.content}>
            <Flex.Row align={FlexAlignment.CENTER} gap="0.5rem" className={sessionStyles.heading}>
                <Text.Span className={sessionStyles.agent} title={session.userAgent}>
                    {browser || session.userAgent || t("sessions.unknownBrowser")}
                </Text.Span>
                {current && <Badge tone={BadgeTone.SUCCESS}>{t("sessions.current")}</Badge>}
            </Flex.Row>
            <Text.Span size={TextSize.XS} tone={TextTone.MUTED}>
                {agent?.os.name ?? t("sessions.unknownPlatform")}
            </Text.Span>
        </Flex.Col>
    );
}
