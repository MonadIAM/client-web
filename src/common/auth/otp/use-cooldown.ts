import { useCallback, useSyncExternalStore } from "react";

import { CooldownOTP } from "./cooldown";

export function useCooldownOTP({ flow }: Auth.OTP.Cooldown.Use.Props): Auth.OTP.Cooldown.Use.Result {
    const getSnapshot = useCallback(() => CooldownOTP.remaining({ flow }), [flow]);
    return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribe(listener: Auth.OTP.Cooldown.Listener): Auth.OTP.Cooldown.Unsubscribe {
    const interval = window.setInterval(listener, 1e3);

    window.addEventListener(CooldownOTP.event, listener);
    window.addEventListener("storage", listener);
    window.addEventListener("focus", listener);

    return () => {
        window.clearInterval(interval);
        window.removeEventListener(CooldownOTP.event, listener);
        window.removeEventListener("storage", listener);
        window.removeEventListener("focus", listener);
    };
}
