import { AxiosError } from "axios";

import { NotificationManager } from "~shared/notifications";

class Cooldown implements Auth.OTP.Cooldown.Contract {
    public static readonly instance = new Cooldown();

    public readonly deadlines = new Map<Auth.OTP.Cooldown.Flow, number>();
    public readonly duration = Number(process.env.OTP_COOLDOWN);
    public readonly event = "monadiam:otp-cooldown";

    private constructor() {}

    public remaining({ flow }: Auth.OTP.Cooldown.Remaining.Props): Auth.OTP.Cooldown.Remaining.Result {
        let deadline = this.deadlines.get(flow) ?? 0;
        try {
            const stored = Number(localStorage.getItem(`monadiam.otp.${flow}`));
            if (Number.isFinite(stored)) {
                deadline = Math.max(deadline, stored);
            }
        } catch {
            deadline = this.deadlines.get(flow) ?? 0;
        }
        return Math.max(0, Math.ceil((deadline - Date.now()) / 1e3));
    }

    public start({ flow, delay = this.duration }: Auth.OTP.Cooldown.Start.Props): Auth.OTP.Cooldown.Start.Result {
        const deadline = Date.now() + delay;
        this.deadlines.set(flow, deadline);
        try {
            localStorage.setItem(`monadiam.otp.${flow}`, String(deadline));
        } catch (cause) {
            NotificationManager.error({ cause });
        }
        window.dispatchEvent(new Event(this.event));
    }

    public recover({ flow, cause }: Auth.OTP.Cooldown.Recover.Props): Auth.OTP.Cooldown.Recover.Result {
        if (cause instanceof AxiosError && cause.response?.status === 429) {
            const retryAfter = cause.response.headers["retry-after"];
            const seconds = Number(retryAfter);
            const delay = Number.isFinite(seconds) && seconds > 0 ? seconds * 1e3 : this.duration;
            this.start({ flow, delay });
        }
    }
}

export const CooldownOTP: Auth.OTP.Cooldown.PublicContract = Cooldown.instance;
