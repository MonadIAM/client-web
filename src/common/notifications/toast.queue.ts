class Queue implements Notifications.Queue.Contract {
    public static readonly instance = new Queue();

    public readonly waiting = new Map<string, Notifications.Queue.Entry>();
    public readonly visible = new Map<string, Notifications.Queue.Entry>();
    public readonly limit = Number(process.env.TOAST_VISIBLE_LIMIT);

    public transport: Optional<Notifications.Transport>;

    private constructor() {}

    public add(props: Notifications.Queue.Add.Props): Notifications.Queue.Add.Result {
        const id = props.id ?? crypto.randomUUID();
        const current = this.visible.get(id);
        if (current && !current.closing) {
            current.options = { ...current.options, ...props, id };
            if (this.transport) {
                this.present({ entry: current, transport: this.transport });
            }
        } else {
            const queued = this.waiting.get(id);
            this.waiting.set(id, { options: { ...queued?.options, ...props, id }, closing: false });
            this.drain();
        }
        return id;
    }

    public update(props: Notifications.Queue.Update.Props): Notifications.Queue.Update.Result {
        const { id, options } = props;
        const entry = this.waiting.get(id) ?? this.visible.get(id);
        if (entry) {
            this.add({ ...entry.options, ...options, id });
        }
    }

    public close(props: Notifications.Queue.Close.Props = {}): Notifications.Queue.Close.Result {
        const { id } = props;
        if (id) {
            this.waiting.delete(id);
            if (this.transport) {
                this.transport.close(id);
            } else {
                this.visible.delete(id);
            }
        } else {
            this.waiting.clear();
            if (this.transport) {
                this.transport.close();
            } else {
                this.visible.clear();
            }
        }
    }

    public connect(props: Notifications.Queue.Connect.Props): Notifications.Queue.Connect.Result {
        const { transport } = props;
        this.transport = transport;
        for (const entry of this.visible.values()) {
            this.present({ entry, transport });
        }
        this.drain();
        return () => {
            if (this.transport === transport) {
                this.transport = undefined;
            }
        };
    }

    public present(props: Notifications.Queue.Present.Props): Notifications.Queue.Present.Result {
        const { entry, transport } = props;
        const id = entry.options.id;
        transport.add({
            ...entry.options,
            onClose: () => {
                entry.closing = true;
            },
            onRemove: () => {
                queueMicrotask(() => {
                    if (this.transport === transport && this.visible.get(id) === entry) {
                        this.visible.delete(id);
                        this.drain();
                    }
                });
            },
        });
    }

    public drain(): Notifications.Queue.Drain.Result {
        while (this.transport && this.visible.size < this.limit && this.waiting.size > 0) {
            const next = this.waiting.values().next().value;
            if (!next || this.visible.has(next.options.id)) {
                break;
            } else {
                this.waiting.delete(next.options.id);
                this.visible.set(next.options.id, next);
                this.present({ entry: next, transport: this.transport });
            }
        }
    }
}

export const ToastQueue: Notifications.Queue.PublicContract = Queue.instance;
