import { useQuery } from "@tanstack/react-query";

import { useSession } from "~shared/auth";

import { SecondFactorManager } from "./second-factor.manager";

export function useSecondFactorSetupQuery({ factor, setup }: SecondFactors.SetupPanel.Props) {
    const session = useSession();

    return useQuery({
        queryKey: ["second-factor-setup", session.revision, factor?.id],
        enabled: Boolean(factor) && !setup,
        queryFn: ({ signal }) => SecondFactorManager.setup({ id: factor?.id ?? "", signal }),
        gcTime: 0,
        refetchOnWindowFocus: false,
    });
}
