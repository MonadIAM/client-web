export const pageStyles = {
    details: "grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch",
    avatarFrame:
        "group/avatar relative row-start-1 size-20 cursor-pointer overflow-hidden rounded-full outline-none transition-shadow hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none sm:col-start-2 sm:row-start-1 sm:mt-6.5 sm:mb-6.5 sm:aspect-square sm:size-auto",
    avatar: "absolute inset-0 size-full text-2xl sm:text-4xl",
    avatarOverlay:
        "absolute inset-0 bg-black/25 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100",
    avatarIcon: "size-5 sm:size-6",
    identifier: "font-mono",
    copyIcon: "size-3.5",
    copyStatus: "sr-only",
};

export const profileLayoutStyles = {
    root: "mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10",
    navigation: "overflow-x-auto border-b border-border",
    link: "shrink-0 border-b-2 border-transparent px-1 pb-3 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:border-primary aria-[current=page]:text-primary",
};
