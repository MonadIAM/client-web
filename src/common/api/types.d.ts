import { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import * as AccessControlTypes from "./generated/access-control";
import * as NotificationTypes from "./generated/notification";
import * as OrganizationTypes from "./generated/organization";
import * as IdentityTypes from "./generated/identity";
import * as HrTypes from "./generated/hr";

declare global {
    namespace API {
        export import AccessControl = AccessControlTypes;
        export import Notification = NotificationTypes;
        export import Organization = OrganizationTypes;
        export import Identity = IdentityTypes;
        export import Hr = HrTypes;

        namespace Transport {
            type Response = AxiosResponse<unknown>;

            type Request = InternalAxiosRequestConfig<unknown>;

            namespace Recover {
                type Props = {
                    error: unknown;
                    transport: AxiosInstance;
                };

                type Result = Promise<Response>;
            }

            namespace Retry {
                type Props = {
                    config: AxiosRequestConfig<unknown>;
                    credential: Auth.Session.Credential;
                    transport: AxiosInstance;
                };

                type Result = Promise<Response>;
            }
        }
    }
}

declare module "axios" {
    interface AxiosRequestConfig {
        authSession?: Auth.Session.Credential;
        authRetried?: boolean;
    }
}
