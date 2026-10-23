import axios, { AxiosError, CanceledError, AxiosInstance } from "axios";

import { AuthClient } from "~auth/client";

import { client as accessControl } from "./generated/access-control/client.gen";
import { client as notification } from "./generated/notification/client.gen";
import { client as organization } from "./generated/organization/client.gen";
import { client as identity } from "./generated/identity/client.gen";
import { client as hr } from "./generated/hr/client.gen";

export abstract class API {
    public static readonly identityPublic = axios.create({
        timeout: Number(process.env.API_REQUEST_TIMEOUT_MS),
        withCredentials: true,
    });

    private static initialized = false;

    private constructor() {}

    public static initialize(): void {
        if (this.initialized === false) {
            this.initialized = true;
            accessControl.setConfig({
                axios: this.createTransport(process.env.ACCESS_CONTROL_ORIGIN),
                baseURL: process.env.ACCESS_CONTROL_ORIGIN,
            });
            identity.setConfig({
                axios: this.createTransport(process.env.IDENTITY_ORIGIN),
                baseURL: process.env.IDENTITY_ORIGIN,
            });
            notification.setConfig({
                axios: this.createTransport(process.env.NOTIFICATION_ORIGIN),
                baseURL: process.env.NOTIFICATION_ORIGIN,
            });
            organization.setConfig({
                axios: this.createTransport(process.env.ORGANIZATION_ORIGIN),
                baseURL: process.env.ORGANIZATION_ORIGIN,
            });
            hr.setConfig({
                axios: this.createTransport(process.env.HR_ORIGIN),
                baseURL: process.env.HR_ORIGIN,
            });
        }
    }

    private static createTransport(origin: string): AxiosInstance {
        const transport = axios.create({ timeout: Number(process.env.API_REQUEST_TIMEOUT_MS) });
        transport.interceptors.request.use((config) => this.authorize(config, origin));
        transport.interceptors.response.use(
            (response: API.Transport.Response) => this.accept(response),
            (error: unknown) => this.recover({ error, transport }),
        );
        return transport;
    }

    private static async authorize(config: API.Transport.Request, origin: string): Promise<API.Transport.Request> {
        const url = new URL(config.url ?? "", origin);
        if (url.origin === new URL(origin).origin) {
            const credential = await AuthClient.getToken({ revision: config.authSession?.revision });
            if (config.signal?.aborted) {
                throw new CanceledError();
            } else {
                const headers = axios.AxiosHeaders.from(config.headers);
                headers.set("Authorization", `Bearer ${credential.token}`);
                return { ...config, headers, authSession: credential };
            }
        } else {
            throw new Error("The API request targets an unexpected origin");
        }
    }

    private static accept(response: API.Transport.Response): API.Transport.Response {
        const credential = response.config.authSession;
        const current = AuthClient.getSnapshot();
        if (credential?.revision === current.revision && current.status === "authenticated") {
            return response;
        } else {
            throw new CanceledError("The session has ended or changed");
        }
    }

    private static recover(props: API.Transport.Recover.Props): API.Transport.Recover.Result {
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

    private static async retry(props: API.Transport.Retry.Props): API.Transport.Retry.Result {
        const credential = await AuthClient.getToken({
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
