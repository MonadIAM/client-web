export const pageStyles = {
    section: "border-0 bg-transparent p-0 sm:p-0",
    panel: "rounded-lg border border-border bg-card p-4 text-card-foreground sm:p-6",
    details: "grid gap-6 sm:grid-cols-[13.5rem_minmax(0,1fr)]",
    detailsForm: "flex min-w-0 flex-col justify-between gap-4",
    detailsGrid: "grid min-w-0 gap-x-5 gap-y-1 md:grid-cols-2",
    avatarPanel:
        "flex flex-col items-center justify-center gap-6 border-b border-border pb-6 sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0",
    avatar: "size-32 shrink-0 text-4xl sm:size-40 sm:text-5xl",
    identifier: "font-mono",
    copyIcon: "size-3.5",
    copyStatus: "sr-only",
};

export const profileLayoutStyles = {
    root: "mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10",
    navigation: "overflow-x-auto border-b border-border",
    link: "shrink-0 border-b-2 border-transparent px-1 pb-3 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:text-primary",
};
