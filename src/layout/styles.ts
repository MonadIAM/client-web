export const layoutStyles = {
    root: "flex min-h-dvh flex-col bg-background text-foreground",
    header: "sticky top-0 z-30",
    content: "flex min-h-0 min-w-0 flex-1 flex-col outline-none",
    skip: "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground",
    brand: "inline-flex items-center gap-2 rounded-sm font-display text-xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring",
    markLight: "block size-9 dark:hidden",
    markDark: "hidden size-9 dark:block",
    profile: "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
};
