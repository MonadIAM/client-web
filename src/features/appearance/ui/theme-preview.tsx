import { ThemeMode } from "@monadiam/ui-kit/enums";

import { themePreviewStyles as styles } from "./styles";

export function ThemePreview({ mode }: { mode: ThemeMode | "system" }) {
    const dark = mode === ThemeMode.DARK;
    const darkSidebar = mode !== ThemeMode.LIGHT;

    return (
        <span className={`${styles.frame} ${dark ? styles.darkFrame : styles.lightFrame}`}>
            <span className={`${styles.sidebar} ${darkSidebar ? styles.darkSidebar : styles.lightSidebar}`}>
                {[0, 1, 2].map((item) => (
                    <span
                        key={item}
                        className={`${styles.navigation} ${darkSidebar ? styles.darkNavigation : styles.lightNavigation}`}
                    />
                ))}
            </span>
            <span className={styles.content}>
                <span className={`${styles.heading} ${dark ? styles.darkHeading : styles.lightHeading}`} />
                <span className={`${styles.block} ${dark ? styles.darkBlock : styles.lightBlock}`} />
                <span className={`${styles.block} ${styles.shortBlock} ${dark ? styles.darkBlock : styles.lightBlock}`} />
            </span>
        </span>
    );
}
