import { useQuery } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";

import { useSession } from "../session/use-session";
import { SessionStatus } from "../session/enums";
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
