import { QueryOrder } from "~shared/api/generated/identity";
import { IdentitySDK } from "~shared/api/sdk";

import { IdentifierSchema } from "./schema";

class Manager implements Identifiers.Manager.Contract {
    public static readonly instance = new Manager();

    private static readonly batchSize = 100;

    private constructor() {}

    public async list({ signal }: Identifiers.Manager.List.Props): Identifiers.Manager.List.Result {
        const identifiers = await this.load({ signal, currentPage: 1 });

        return identifiers.sort((first, second) => {
            const createdAtOrder = first.createdAt.localeCompare(second.createdAt);

            return createdAtOrder || first.id.localeCompare(second.id);
        });
    }

    public async load({ signal, currentPage }: Identifiers.Manager.Load.Props): Identifiers.Manager.Load.Result {
        const response = await IdentitySDK.identifierControllerFindMany({
            body: {
                pagination: { currentPage, elementsPerPage: Manager.batchSize },
                sort: { createdAt: QueryOrder.ASC },
                filters: {},
            },
            signal,
            throwOnError: true,
        });

        const { data, meta } = IdentifierSchema.list.parse(response.data);

        if (currentPage < meta.totalPages) {
            const remaining = await this.load({ signal, currentPage: currentPage + 1 });

            return [...data, ...remaining];
        }

        return data;
    }

    public async create({ identifier, type }: Identifiers.Manager.Create.Props): Identifiers.Manager.Create.Result {
        await IdentitySDK.identifierControllerCreate({
            body: {
                identifier,
                type,
            },
            throwOnError: true,
        });
    }

    public async verify(body: Identifiers.Manager.Verify.Props): Identifiers.Manager.Verify.Result {
        await IdentitySDK.identifierControllerVerify({
            body,
            throwOnError: true,
        });
    }

    public async resend(body: Identifiers.Manager.Resend.Props): Identifiers.Manager.Resend.Result {
        await IdentitySDK.identifierControllerResend({
            body,
            throwOnError: true,
        });
    }

    public async toggle(body: Identifiers.Manager.Toggle.Props): Identifiers.Manager.Toggle.Result {
        await IdentitySDK.identifierControllerTogglePublicContact({
            body,
            throwOnError: true,
        });
    }

    public async remove(query: Identifiers.Manager.Remove.Props): Identifiers.Manager.Remove.Result {
        await IdentitySDK.identifierControllerPurge({
            query,
            throwOnError: true,
        });
    }
}

export const IdentifierManager: Identifiers.Manager.PublicContract = Manager.instance;
