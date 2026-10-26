import { useQuery } from "@tanstack/react-query";

import { SessionStatus } from "~src/enums";
import { IdentitySDK } from "~api/sdk";

import { useSession } from "../session/use-session";
import { ProfileSchema } from "./profile.schema";

export function useProfile(): Auth.Profile.UseProfile.Result {
    const session = useSession();
    return useQuery({
        queryKey: ["profile", session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        staleTime: Infinity,
        queryFn: async ({ signal }) => {
            const response = await IdentitySDK.oAuthControllerGetUserInfo({ signal, throwOnError: true });
            return ProfileSchema.response.parse(response.data);
        },
    });
}
