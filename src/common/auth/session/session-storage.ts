import { OAuthSchema } from "../oauth.schema";

export abstract class SessionStorage {
    private static database: Optional<Promise<IDBDatabase>>;

    private constructor() {}

    private static get key(): string {
        return `${process.env.OAUTH_ISSUER}:${process.env.OAUTH_CLIENT_ID}`;
    }

    public static readSession(): Promise<Optional<Auth.Session.Stored>> {
        return this.read({ key: this.key, schema: OAuthSchema.stored.optional() });
    }

    public static writeSession(value: Auth.Session.Stored): Promise<void> {
        return this.write({ key: this.key, value });
    }

    public static readTransaction(): Promise<Optional<Auth.Session.Transaction>> {
        return this.read({ key: `${this.key}:authorization`, schema: OAuthSchema.transaction.optional() });
    }

    public static writeTransaction(value: Auth.Session.Transaction): Promise<void> {
        return this.write({ key: `${this.key}:authorization`, value });
    }

    public static async deleteTransaction(): Promise<void> {
        const database = await this.open();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction("auth", "readwrite");
            transaction.objectStore("auth").delete(`${this.key}:authorization`);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error);
        });
    }

    private static open(): Promise<IDBDatabase> {
        this.database ??= new Promise((resolve, reject) => {
            const request = indexedDB.open("monadiam-auth", 1);
            request.onupgradeneeded = () => {
                request.result.createObjectStore("auth");
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error("Session storage is blocked by another tab"));
        });
        return this.database;
    }

    private static async read<T>(props: Auth.Session.Storage.Read.Props<T>): Auth.Session.Storage.Read.Result<T> {
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

    private static async write(props: Auth.Session.Storage.Write.Props): Auth.Session.Storage.Write.Result {
        const database = await this.open();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction("auth", "readwrite");
            transaction.objectStore("auth").put(props.value, props.key);
            transaction.oncomplete = () => resolve();
            transaction.onabort = () => reject(transaction.error);
        });
    }
}
