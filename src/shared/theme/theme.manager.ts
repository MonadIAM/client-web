import { ThemeMode } from "@monadiam/ui-kit/enums";

import { NotificationManager } from "~shared/notifications";

class Manager implements Theme.Contract {
    public static readonly instance = new Manager();

    public readonly system = matchMedia("(prefers-color-scheme: dark)");
    public readonly listeners = new Set<Theme.Listener>();
    public readonly storageKey = "monadiam.theme";

    public current: Theme.Mode = document.documentElement.classList.contains(ThemeMode.DARK)
        ? ThemeMode.DARK
        : ThemeMode.LIGHT;
    public preference: Optional<Theme.Mode>;
    public initialized = false;

    private constructor() {}

    public initialize(): Theme.Initialize.Result {
        if (!this.initialized) {
            this.initialized = true;
            this.synchronize();
            this.system.addEventListener("change", () => {
                if (!this.preference) {
                    this.apply({ mode: this.system.matches ? ThemeMode.DARK : ThemeMode.LIGHT });
                }
            });
            window.addEventListener("storage", (event) => {
                if (event.storageArea === localStorage && (event.key === this.storageKey || event.key === null)) {
                    this.synchronize();
                }
            });
        }
    }

    public getSnapshot(): Theme.GetSnapshot.Result {
        return this.current;
    }

    public subscribe({ listener }: Theme.Subscribe.Props): Theme.Subscribe.Result {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public readPreference(): Theme.ReadPreference.Result {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored === ThemeMode.LIGHT || stored === ThemeMode.DARK ? stored : undefined;
        } catch {
            return undefined;
        }
    }

    public synchronize(): Theme.Synchronize.Result {
        this.preference = this.readPreference();
        this.apply({
            mode: this.preference ?? (this.system.matches ? ThemeMode.DARK : ThemeMode.LIGHT),
        });
    }

    public apply({ mode }: Theme.Apply.Props): Theme.Apply.Result {
        this.current = mode;
        const root = document.documentElement;
        root.classList.toggle(ThemeMode.DARK, mode === ThemeMode.DARK);
        root.classList.toggle(ThemeMode.LIGHT, mode === ThemeMode.LIGHT);
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", mode === ThemeMode.DARK ? "#09090b" : "#fafafa");
        for (const listener of this.listeners) {
            listener();
        }
    }

    public toggle(): Theme.Toggle.Result {
        this.preference = this.current === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK;
        this.apply({ mode: this.preference });
        try {
            localStorage.setItem(this.storageKey, this.preference);
        } catch (cause) {
            NotificationManager.error({ cause });
        }
    }
}

export const ThemeManager: Theme.PublicContract = Manager.instance;
