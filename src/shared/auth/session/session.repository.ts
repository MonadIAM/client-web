import { OAuthSchema } from "../oauth/oauth.schema";

class Repository implements Auth.Session.Repository.Contract {
    public static readonly instance = new Repository();

    public database: Optional<Promise<IDBDatabase>>;

    private constructor() {}

    public get key(): string {
        return `${process.env.OAUTH_ISSUER}:${process.env.OAUTH_CLIENT_ID}`;
    }

    public readSession(): Auth.Session.Repository.ReadSession.Result {
        return this.read({ key: this.key, schema: OAuthSchema.stored.optional() });
    }

    public writeSession(props: Auth.Session.Repository.WriteSession.Props): Auth.Session.Repository.WriteSession.Result {
        return this.write({ key: this.key, value: props.value });
    }

    public readTransaction(): Auth.Session.Repository.ReadTransaction.Result {
        return this.read({ key: `${this.key}:authorization`, schema: OAuthSchema.transaction.optional() });
    }

    public writeTransaction(
        props: Auth.Session.Repository.WriteTransaction.Props,
    ): Auth.Session.Repository.WriteTransaction.Result {
        return this.write({ key: `${this.key}:authorization`, value: props.value });
    }

    public async deleteTransaction(): Auth.Session.Repository.DeleteTransaction.Result {
        const database = await this.open();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction("auth", "readwrite");
            transaction.objectStore("auth").delete(`${this.key}:authorization`);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error);
        });
    }

    public open(): Auth.Session.Repository.Open.Result {
        this.database ??= new Promise((resolve, reject) => {
            const request = indexedDB.open("monadiam-auth", 1);
            request.onupgradeneeded = () => request.result.createObjectStore("auth");
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error("Session storage is blocked by another tab"));
        });
        return this.database;
    }

    public async read<T>(props: Auth.Session.Repository.Read.Props<T>): Auth.Session.Repository.Read.Result<T> {
        const database = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction("auth", "readonly");
            const request = transaction.objectStore("auth").get(props.key);
            transaction.oncomplete = () => {
                const result = props.schema.safeParse(request.result);
                if (result.success) {
                    resolve(result.data);
                } else {
                    reject(result.error);
                }
            };
            transaction.onabort = () => reject(transaction.error);
        });
    }

    public async write(props: Auth.Session.Repository.Write.Props): Auth.Session.Repository.Write.Result {
        const database = await this.open();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction("auth", "readwrite");
            transaction.objectStore("auth").put(props.value, props.key);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error);
        });
    }
}

export const SessionRepository: Auth.Session.Repository.PublicContract = Repository.instance;
