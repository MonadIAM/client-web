import { AxiosError } from "axios";

import { IdentitySchemas } from "~api/schemas";

export function getValidationErrors<const TName extends string>({
    fields,
    cause,
}: API.Validation.Props<TName>): API.Validation.Result<TName> {
    if (cause instanceof AxiosError && cause.response?.status === 422) {
        const parsed = IdentitySchemas.zErrorResponseBody.safeParse(cause.response.data);
        const errors: Partial<Record<TName, string>> = {};
        if (parsed.success) {
            for (const issue of parsed.data.details ?? []) {
                const field = fields.find((name) => name === issue.path);
                if (field) {
                    errors[field] ??= issue.message;
                }
            }
        }
        return Object.keys(errors).length ? errors : undefined;
    } else {
        return undefined;
    }
}
