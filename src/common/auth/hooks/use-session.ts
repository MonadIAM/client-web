import { useSyncExternalStore } from "react";

import { AuthWorkerClient } from "../worker.client";

const subscribe = (listener: Auth.Listener) => AuthWorkerClient.subscribe({ listener });
const getSnapshot = () => AuthWorkerClient.getSnapshot();

export function useSession(): Auth.Hooks.UseSession.Result {
    return useSyncExternalStore(subscribe, getSnapshot);
}
