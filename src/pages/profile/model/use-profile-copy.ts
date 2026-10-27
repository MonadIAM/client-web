import { useEffect, useState } from "react";

import { NotificationManager } from "~shared/notifications";

export function useProfileCopy({ value }: ProfileCopy.Props): ProfileCopy.Result {
    const [copiedValue, setCopiedValue] = useState<string>();

    useEffect(() => {
        if (copiedValue === undefined) {
            return undefined;
        }

        const timer = window.setTimeout(() => setCopiedValue(undefined), Number(process.env.COPY_FEEDBACK_DURATION_MS));

        return () => window.clearTimeout(timer);
    }, [copiedValue]);

    const copy: ProfileCopy.Copy.Signature = async () => {
        try {
            await navigator.clipboard.writeText(value);

            setCopiedValue(value);
        } catch (cause) {
            NotificationManager.error({ cause });
        }
    };

    return { copied: copiedValue === value, copy };
}
