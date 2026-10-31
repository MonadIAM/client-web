import { TextTone } from "@monadiam/ui-kit/enums";
import { Text } from "@monadiam/ui-kit";
import { AxiosError } from "axios";

import { NotificationManager } from "~shared/notifications";

import { queryErrorStyles } from "./styles";

export function QueryError({ cause, fallback }: QueryError.Props) {
    let message = fallback;
    if (cause instanceof AxiosError) {
        const response = NotificationManager.getResponseMessage({ data: cause.response?.data });
        if (response?.trim()) {
            message = response;
        }
    }

    return (
        <Text.Span role="alert" tone={TextTone.DANGER} className={queryErrorStyles.root}>
            {message}
        </Text.Span>
    );
}
