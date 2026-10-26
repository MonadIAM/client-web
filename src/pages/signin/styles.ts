export const pageStyles = {
    auth: "flex flex-1 flex-col items-center justify-center px-5 pt-10 pb-16 sm:pb-24",
    authPreparation: "flex min-h-60 flex-col items-center justify-center gap-3 text-center text-sm font-medium",
    authContent: "w-full max-w-[400px]",
    header: "mb-7 grid gap-3 text-center",
    panel: "grid min-w-0 gap-5 rounded-lg border border-border bg-card p-6 shadow-xs",
    footer: "mt-6 flex min-w-0 flex-col gap-1 text-center text-sm leading-6 text-muted-foreground [&_a]:rounded-sm [&_a]:text-primary [&_a]:outline-none [&_a]:underline-offset-4 [&_a:hover]:underline [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring",
    title: "text-2xl font-semibold tracking-tight",
    description: "text-sm leading-6 text-muted-foreground",
};

export const socialStyles = {
    root: "mt-5 grid gap-3",
    separator:
        "flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
    button: "flex-1",
};
