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
            hasEmail: boolean;
            disabled: boolean;

            onToggle(category: NotificationSettings.Category): void;
        };
    }

    namespace Region {
        type Props = {
            recipient: NotificationSettings.Recipient;
        };
    }
}
