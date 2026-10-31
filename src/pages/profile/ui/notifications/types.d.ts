declare namespace NotificationSettingsView {
    namespace Sound {
        type Props = {
            channel?: NotificationSettings.Channel;
            disabled: boolean;

            onToggle(): void;
        };
    }

    namespace Email {
        type Props = {
            preferences: NotificationSettings.Preference[];
            channel?: NotificationSettings.Channel;
            emails: Identifiers.Identifier[];
            hasEmail: boolean;
            disabled: boolean;

            onSelect(identifier: string): Promise<void>;
            onToggle(category: NotificationSettings.Category): void;
        };

        type AddressProps = Pick<Props, "channel" | "emails" | "disabled" | "onSelect">;
    }

    namespace Region {
        type Props = {
            recipient: NotificationSettings.Recipient;
        };
    }
}
