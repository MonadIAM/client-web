import { useQuery } from "@tanstack/react-query";

import { IdentitySDK } from "~shared/api/sdk";

import { useSession } from "../session/use-session";
import { SessionStatus } from "../session/enums";
import { AccountSchema } from "./account.schema";

export const accountQueryKey = ["account"];

export function useAccount(): Auth.Account.UseAccount.Result {
    const session = useSession();

    return useQuery({
        queryKey: [...accountQueryKey, session.revision],
        enabled: session.status === SessionStatus.AUTHENTICATED,
        staleTime: Number(process.env.AUTH_ACCOUNT_STALE_TIME_MS),

        queryFn: async ({ signal }) => {
            const response = await IdentitySDK.accountControllerFindMe({
                signal,
                throwOnError: true,
                responseTransformer: undefined,
            });

            return AccountSchema.details.parse(response.data);
        },
    });
}
