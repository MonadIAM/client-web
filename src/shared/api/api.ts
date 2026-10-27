import axios, { AxiosError, CanceledError } from "axios";

import { AuthWorkerClient } from "~shared/auth/worker.client";
import { SessionStatus } from "~shared/auth/session";
import { i18n } from "~shared/i18n";
import { Environment } from "~shared/config/enums";

import { client as accessControl } from "./generated/access-control/client.gen";
import { client as notification } from "./generated/notification/client.gen";
import { client as organization } from "./generated/organization/client.gen";
import { client as identity } from "./generated/identity/client.gen";
import { client as hr } from "./generated/hr/client.gen";

class ApiTransport implements API.Transport.Contract {
    public static readonly instance = new ApiTransport();

    public readonly identityPublic = axios.create({
        timeout: Number(process.env.API_REQUEST_TIMEOUT_MS),
        withCredentials: true,
    });

    public initialized = false;

    private constructor() {}

    public initialize(): void {
        if (this.initialized === false) {
            this.initialized = true;
            this.identityPublic.interceptors.request.use((config) => {
                if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
                    const url = new URL(config.url ?? "", process.env.IDENTITY_ORIGIN);

                    if (url.origin === new URL(process.env.IDENTITY_ORIGIN).origin) {
                        config.baseURL = location.origin;
                        config.url = `${url.pathname}${url.search}`;
                    }
                }

                config.headers.set("Accept-Language", i18n.resolvedLanguage ?? "en");

                return config;
            });
            accessControl.setConfig({
                axios: this.createTransport({ origin: process.env.ACCESS_CONTROL_ORIGIN }),
                baseURL: process.env.ACCESS_CONTROL_ORIGIN,
            });
            identity.setConfig({
                axios: this.createTransport({ origin: process.env.IDENTITY_ORIGIN }),
                baseURL: process.env.IDENTITY_ORIGIN,
            });
            notification.setConfig({
                axios: this.createTransport({ origin: process.env.NOTIFICATION_ORIGIN }),
                baseURL: process.env.NOTIFICATION_ORIGIN,
            });
            organization.setConfig({
                axios: this.createTransport({ origin: process.env.ORGANIZATION_ORIGIN }),
                baseURL: process.env.ORGANIZATION_ORIGIN,
            });
            hr.setConfig({
                axios: this.createTransport({ origin: process.env.HR_ORIGIN }),
                baseURL: process.env.HR_ORIGIN,
            });
        }
    }

    public createTransport(props: API.Transport.CreateTransport.Props): API.Transport.CreateTransport.Result {
        const origin = props.origin;
        const transport = axios.create({ timeout: Number(process.env.API_REQUEST_TIMEOUT_MS) });
        transport.interceptors.request.use((config) => this.authorize({ config, origin }));
        transport.interceptors.response.use(
            (response: API.Transport.Response) => this.accept({ response }),
            (error: unknown) => this.recover({ error, transport }),
        );
        return transport;
    }

    public async authorize(props: API.Transport.Authorize.Props): API.Transport.Authorize.Result {
        const { config, origin } = props;
        const url = new URL(config.url ?? "", origin);
        if (url.origin === new URL(origin).origin) {
            const credential = await AuthWorkerClient.getToken({ revision: config.authSession?.revision });
            if (config.signal?.aborted) {
                throw new CanceledError();
            } else {
                const headers = axios.AxiosHeaders.from(config.headers);
                headers.set("Accept-Language", i18n.resolvedLanguage ?? "en");
                headers.set("Authorization", `Bearer ${credential.token}`);
                return { ...config, headers, authSession: credential };
            }
        } else {
            throw new Error("The API request targets an unexpected origin");
        }
    }

    public accept(props: API.Transport.Accept.Props): API.Transport.Accept.Result {
        const response = props.response;
        const credential = response.config.authSession;
        const current = AuthWorkerClient.getSnapshot();
        if (credential?.revision === current.revision && current.status === SessionStatus.AUTHENTICATED) {
            return response;
        } else {
            throw new CanceledError("The session has ended or changed");
        }
    }

    public recover(props: API.Transport.Recover.Props): API.Transport.Recover.Result {
        if (props.error instanceof AxiosError) {
            const config = props.error.config;
            const challenge = String(props.error.response?.headers["www-authenticate"] ?? "");
            const invalidToken = /\bBearer\b/i.test(challenge) && /\berror="?invalid_token"?(?:\s|,|$)/.test(challenge);
            const retryAvailable = config?.authRetried === undefined || config.authRetried === false;

            if (config?.authSession && retryAvailable && props.error.response?.status === 401 && invalidToken) {
                return this.retry({ config, credential: config.authSession, transport: props.transport });
            } else {
                throw props.error;
            }
        } else {
            throw props.error;
        }
    }

    public async retry(props: API.Transport.Retry.Props): API.Transport.Retry.Result {
        const credential = await AuthWorkerClient.getToken({
            revision: props.credential.revision,
            rejectedToken: props.credential.token,
        });
        if (props.config.signal?.aborted) {
            throw new CanceledError();
        } else {
            return props.transport.request({ ...props.config, authRetried: true, authSession: credential });
        }
    }
}

export const API: API.Transport.PublicContract = ApiTransport.instance;
