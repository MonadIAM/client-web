import type { z } from "zod";

import type { NotificationCategory } from "~shared/api/generated/notification";

import type { NotificationSettingsSchema } from "./schema";

declare global {
    namespace NotificationSettings {
        type Channel = z.infer<typeof NotificationSettingsSchema.channel>;
        type Preference = z.infer<typeof NotificationSettingsSchema.preference>;
        type Recipient = z.infer<typeof NotificationSettingsSchema.recipient>;
        type Region = Pick<Recipient, "locale" | "timezone">;

        type Category = Exclude<NotificationCategory, NotificationCategory.SECURITY>;

        type Data = {
            channels: Channel[];
            preferences: Preference[];
            recipient: Recipient;
        };

        namespace Manager {
            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                updateRegion: UpdateRegion.Signature;
                toggleSound: ToggleSound.Signature;
                toggleEmail: ToggleEmail.Signature;
                get: Get.Signature;
            }

            interface PrivateContract {
                loadPreferences: LoadPreferences.Signature;
                loadChannels: LoadChannels.Signature;
            }

            namespace Get {
                type Props = {
                    signal: AbortSignal;
                };

                type Result = Promise<Data>;

                type Signature = (props: Props) => Result;
            }

            namespace LoadChannels {
                type Props = Get.Props & {
                    currentPage: number;
                };

                type Result = Promise<Channel[]>;

                type Signature = (props: Props) => Result;
            }

            namespace LoadPreferences {
                type Props = LoadChannels.Props;

                type Result = Promise<Preference[]>;

                type Signature = (props: Props) => Result;
            }

            namespace ToggleSound {
                type Result = Promise<void>;

                type Signature = () => Result;
            }

            namespace ToggleEmail {
                type Props = {
                    category: Category;
                };

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }

            namespace UpdateRegion {
                type Props = API.Notification.RecipientUpdateBody;

                type Result = Promise<void>;

                type Signature = (props: Props) => Result;
            }
        }
    }
}
