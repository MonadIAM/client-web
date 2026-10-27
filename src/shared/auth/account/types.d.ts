import type { UseQueryResult } from "@tanstack/react-query";
import type { z } from "zod";

import type { AccountSchema } from "./account.schema";

declare global {
    namespace Auth.Account {
        type Details = z.infer<typeof AccountSchema.details>;

        namespace UseAccount {
            type Result = UseQueryResult<Details, Error>;

            type Signature = () => Result;
        }
    }
}
