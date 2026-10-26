import { ThemeMode } from "@monadiam/ui-kit/enums";
import { ThemeToggle } from "@monadiam/ui-kit";
import { useTranslation } from "react-i18next";
import { useSyncExternalStore } from "react";

import { ThemeManager } from "~common/theme/theme.manager";

const subscribe = (listener: Theme.Listener) => ThemeManager.subscribe({ listener });

const getSnapshot = () => ThemeManager.getSnapshot();

export function ThemeSwitcher() {
    const { t } = useTranslation();
    const theme = useSyncExternalStore(subscribe, getSnapshot);

    return (
        <ThemeToggle
            theme={theme}
            label={t(theme === ThemeMode.DARK ? "common.lightTheme" : "common.darkTheme")}
            onToggle={() => ThemeManager.toggle()}
        />
    );
}
