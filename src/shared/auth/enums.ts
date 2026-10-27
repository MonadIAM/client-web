export enum WorkerCommand {
    INVALIDATE_PERMISSIONS = "invalidatePermissions",
    AUTHORIZE = "authorize",
    SNAPSHOT = "snapshot",
    CALLBACK = "callback",
    LOGOUT = "logout",
    TOKEN = "token",
}

export enum WorkerMessageKind {
    PERMISSIONS = "permissions",
    SESSION = "session",
    RESULT = "result",
    ERROR = "error",
}
