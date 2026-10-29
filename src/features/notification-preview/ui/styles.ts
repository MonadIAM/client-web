export const previewStyles = {
    trigger:
        "relative text-muted-foreground data-[popup-open]:bg-accent data-[popup-open]:text-foreground [&_svg]:size-5.5",
    badge: "absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none tabular-nums text-primary-foreground",
    panel: "flex w-100 flex-col overflow-hidden",
    header: "flex items-center justify-between gap-4 border-b border-border px-5 py-4",
    footer: "border-t border-border px-5 py-4",
    title: "text-base font-semibold",
    item: "px-5 py-4",
    content: "min-w-0 flex-1",
    name: "truncate leading-5 tracking-normal",
    countError: "flex items-center justify-between gap-3 border-b border-border px-5 py-3 text-sm text-muted-foreground",
    date: "mt-1 block",
    body: "line-clamp-2 whitespace-pre-wrap break-words leading-5",
    state: "flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground",
};

export const categoryIconStyles = {
    root: "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary [&_svg]:size-4",
    action: "group/read relative data-[active=true]:hover:bg-primary/20 data-[active=true]:focus-visible:bg-primary/20",
    category: "group-hover/read:opacity-0 group-focus-visible/read:opacity-0",
    read: "absolute opacity-0 group-hover/read:opacity-100 group-focus-visible/read:opacity-100",
};
