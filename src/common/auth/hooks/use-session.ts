import { useSyncExternalStore } from "react";

import { AuthClient } from "../client";

const subscribe = (listener: Auth.Listener) => AuthClient.subscribe(listener);
const getSnapshot = () => AuthClient.getSnapshot();

export function useSession(): Auth.Hooks.UseSession.Result {
    return useSyncExternalStore(subscribe, getSnapshot);
}
