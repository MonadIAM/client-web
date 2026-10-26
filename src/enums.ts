export enum SessionStatus {
    INITIALIZING = "initializing",
    ANONYMOUS = "anonymous",
    AUTHENTICATED = "authenticated",
    UNAVAILABLE = "unavailable",
}

export enum WorkerCommand {
    SNAPSHOT = "snapshot",
    AUTHORIZE = "authorize",
    CALLBACK = "callback",
    TOKEN = "token",
    LOGOUT = "logout",
    INVALIDATE_PERMISSIONS = "invalidatePermissions",
}

export enum WorkerMessageKind {
    RESULT = "result",
    ERROR = "error",
    SESSION = "session",
    PERMISSIONS = "permissions",
}

export enum FederatedProvider {
    GOOGLE = "google",
    GITHUB = "github",
}

export enum OTPFlow {
    SIGNIN = "signin",
    PASSWORD = "password",
    SIGNUP = "signup",
}

export enum PermissionMatch {
    ALL = "all",
    ANY = "any",
}

export enum PasswordRecoveryStep {
    REQUEST = "request",
    OTP = "otp",
    RECOVERY = "recovery",
    COMPLETE = "complete",
}

export enum SignupStep {
    REGISTRATION = "registration",
    VERIFICATION = "verification",
    RECOVERY = "recovery",
}

export enum Language {
    RU = "ru",
    EN = "en",
}
