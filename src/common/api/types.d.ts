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
            type Request = InternalAxiosRequestConfig<unknown>;
            type Response = AxiosResponse<unknown>;

            interface Contract extends PublicContract, PrivateContract {}

            interface PublicContract {
                identityPublic: AxiosInstance;

                initialize: Initialize.Signature;
            }

            namespace Initialize {
                type Result = void;

                type Signature = () => Result;
            }

            interface PrivateContract {
                initialized: boolean;

                createTransport: Transport.CreateTransport.Signature;
                authorize: Transport.Authorize.Signature;
                accept: Transport.Accept.Signature;
                recover: Transport.Recover.Signature;
                retry: Transport.Retry.Signature;
            }

            namespace CreateTransport {
                type Props = {
                    origin: string;
                };

                type Result = AxiosInstance;

                type Signature = (props: Props) => Result;
            }

            namespace Authorize {
                type Props = {
                    config: Request;
                    origin: string;
                };

                type Result = Promise<Request>;

                type Signature = (props: Props) => Result;
            }

            namespace Recover {
                type Props = {
                    transport: AxiosInstance;
                    error: unknown;
                };

                type Result = Promise<Response>;

                type Signature = (props: Props) => Result;
            }

            namespace Accept {
                type Props = {
                    response: Response;
                };

                type Result = Response;

                type Signature = (props: Props) => Result;
            }

            namespace Retry {
                type Props = {
                    config: AxiosRequestConfig<unknown>;
                    credential: Auth.Session.Credential;
                    transport: AxiosInstance;
                };

                type Result = Promise<Response>;

                type Signature = (props: Props) => Result;
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
