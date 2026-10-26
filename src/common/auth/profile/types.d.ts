import { UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { ProfileSchema } from "./profile.schema";

declare global {
    namespace Auth.Profile.UseProfile {
        type Result = UseQueryResult<z.infer<typeof ProfileSchema.response>, Error>;

        type Signature = () => Result;
    }
}
