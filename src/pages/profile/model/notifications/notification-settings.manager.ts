import { ChannelType, PublicStringOperator, QueryOrder } from "~shared/api/generated/notification";
import { NotificationSDK } from "~shared/api/sdk";

import { NotificationSettingsSchema } from "./schema";

class Manager implements NotificationSettings.Manager.Contract {
    public static readonly instance = new Manager();

    private static readonly batchSize = 100;

    private constructor() {}

    public async get({ signal }: NotificationSettings.Manager.Get.Props): NotificationSettings.Manager.Get.Result {
        const [response, channels, preferences] = await Promise.all([
            NotificationSDK.recipientControllerFindUnique({ signal, throwOnError: true }),
            this.loadChannels({ signal, currentPage: 1 }),
            this.loadPreferences({ signal, currentPage: 1 }),
        ]);

        const recipient = NotificationSettingsSchema.recipient.parse(response.data);

        return { recipient, channels, preferences };
    }

    public async loadChannels({
        signal,
        currentPage,
    }: NotificationSettings.Manager.LoadChannels.Props): NotificationSettings.Manager.LoadChannels.Result {
        const response = await NotificationSDK.channelControllerFindMany({
            body: {
                pagination: { currentPage, elementsPerPage: Manager.batchSize },
                sort: { createdAt: QueryOrder.ASC },
                filters: {
                    type: { operator: PublicStringOperator.IN, value: [ChannelType.IN_APP, ChannelType.EMAIL] },
                },
            },
            signal,
            throwOnError: true,
        });

        const { data, meta } = NotificationSettingsSchema.channels.parse(response.data);

        if (currentPage < meta.totalPages) {
            const remaining = await this.loadChannels({ signal, currentPage: currentPage + 1 });

            return [...data, ...remaining];
        }

        return data;
    }

    public async loadPreferences({
        signal,
        currentPage,
    }: NotificationSettings.Manager.LoadPreferences.Props): NotificationSettings.Manager.LoadPreferences.Result {
        const response = await NotificationSDK.preferenceControllerFindMany({
            body: {
                pagination: { currentPage, elementsPerPage: Manager.batchSize },
                sort: { createdAt: QueryOrder.ASC },
                filters: {
                    channelType: { operator: PublicStringOperator.EQUAL, value: ChannelType.EMAIL },
                },
            },
            signal,
            throwOnError: true,
        });

        const { data, meta } = NotificationSettingsSchema.preferences.parse(response.data);

        if (currentPage < meta.totalPages) {
            const remaining = await this.loadPreferences({ signal, currentPage: currentPage + 1 });

            return [...data, ...remaining];
        }

        return data;
    }

    public async toggleSound(): NotificationSettings.Manager.ToggleSound.Result {
        await NotificationSDK.channelControllerToggleSound({ throwOnError: true });
    }

    public async toggleEmail({
        category,
    }: NotificationSettings.Manager.ToggleEmail.Props): NotificationSettings.Manager.ToggleEmail.Result {
        await NotificationSDK.preferenceControllerToggle({
            body: { channelType: ChannelType.EMAIL, category },
            throwOnError: true,
        });
    }

    public async updateRegion(
        body: NotificationSettings.Manager.UpdateRegion.Props,
    ): NotificationSettings.Manager.UpdateRegion.Result {
        await NotificationSDK.recipientControllerUpdate({ body, throwOnError: true });
    }
}

export const NotificationSettingsManager: NotificationSettings.Manager.PublicContract = Manager.instance;
