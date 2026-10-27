import { TextTone } from "@monadiam/ui-kit/enums";
import { Switch, Text } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";

import { useIdentifierToggle } from "../../model/identifiers/use-identifier-toggle";

export function IdentifierPublic({ identifier }: Identifiers.Content.Props) {
    const { t } = useTranslation();
    const toggle = useIdentifierToggle();

    return identifier.isVerified ? (
        <Switch
            label={t("identifiers.publicLabel", { identity: identifier.identity })}
            showLabel={false}
            title={t("identifiers.publicDescription")}
            checked={identifier.isPublicContact}
            disabled={toggle.isPending}
            onCheckedChange={() => toggle.mutate({ identifier: identifier.id })}
        />
    ) : (
        <Text.Span tone={TextTone.MUTED} title={t("identifiers.publicUnavailable")}>
            —
        </Text.Span>
    );
}
