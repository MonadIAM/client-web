import { AxiosError, isCancel } from "axios";

import { ToastQueue } from "./toast.queue";

class Manager implements Notifications.Manager.Contract {
    public static readonly instance = new Manager();

    public readonly limit = ToastQueue.limit;
    public readonly reported = new WeakMap<object, string>();

    private constructor() {}

    public connect(props: Notifications.Manager.Connect.Props): Notifications.Manager.Connect.Result {
        return ToastQueue.connect(props);
    }

    public success(props: Notifications.Manager.Success.Props): Notifications.Manager.Success.Result {
        return ToastQueue.add({ ...props, timeout: props.timeout ?? 5000, type: "success" });
    }

    public info(props: Notifications.Manager.Info.Props): Notifications.Manager.Info.Result {
        return ToastQueue.add({ ...props, timeout: props.timeout ?? 5000, type: "info" });
    }

    public warning(props: Notifications.Manager.Warning.Props): Notifications.Manager.Warning.Result {
        return ToastQueue.add({ ...props, timeout: props.timeout ?? 5000, type: "warning" });
    }

    public error(props: Notifications.Manager.Error.Props): Notifications.Manager.Error.Result {
        const { cause, title, logged = false, ...options } = props;
        if (isCancel(cause) || (cause instanceof Error && cause.name === "AbortError")) {
            return undefined;
        }

        const reference = cause !== null && (typeof cause === "object" || typeof cause === "function") ? cause : undefined;
        const previous = reference && this.reported.get(reference);
        if (previous) {
            return previous;
        }

        if (!logged) {
            this.log({ cause });
        }
        const message = this.getMessage({ cause });
        const id = ToastQueue.add({
            ...options,
            timeout: options.timeout ?? 8000,
            title: title ?? message,
            description: options.description ?? (title && title !== message ? message : undefined),
            type: "error",
        });
        if (reference) {
            this.reported.set(reference, id);
        }
        return id;
    }

    public update(props: Notifications.Manager.Update.Props): Notifications.Manager.Update.Result {
        ToastQueue.update(props);
    }

    public close(props: Notifications.Manager.Close.Props = {}): Notifications.Manager.Close.Result {
        ToastQueue.close(props);
    }

    public getMessage(props: Notifications.Manager.GetMessage.Props): Notifications.Manager.GetMessage.Result {
        const { cause } = props;
        if (cause instanceof AxiosError) {
            const data: unknown = cause.response?.data;
            if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
                return data.message;
            }
        }
        if (cause instanceof Error) {
            return cause.message;
        } else if (typeof cause === "string") {
            return cause;
        } else {
            return "An unexpected error occurred";
        }
    }

    public log(props: Notifications.Manager.Log.Props): Notifications.Manager.Log.Result {
        const { cause } = props;
        if (cause instanceof AxiosError) {
            console.error({
                status: cause.response?.status,
                message: cause.message,
                stack: cause.stack,
                code: cause.code,
                name: cause.name,
            });
        } else {
            console.error(cause);
        }
    }
}

export const NotificationManager: Notifications.Manager.PublicContract = Manager.instance;
