export enum NotificationStreamCommand {
    ATTACH = "attach",
    DETACH = "detach",
    AUDIO = "audio",
    RETRY = "retry",
    TOKEN = "token",
    END_SESSION = "endSession",
}

export enum NotificationStreamMessage {
    STATE = "state",
    SOUND = "sound",
    TOKEN = "token",
}

export enum NotificationStreamStatus {
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    ERROR = "error",
}
