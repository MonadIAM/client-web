import { useTranslation } from "react-i18next";
import { Dialog } from "@monadiam/ui-kit";

import { AppearanceForm } from "./appearance-form";

export function AppearanceDialog({ open, onOpenChange, returnFocus }: Appearance.Props) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Dialog.Content
                title={t("appearance.title")}
                description={t("appearance.description")}
                closeLabel={t("common.close")}
                finalFocus={returnFocus}>
                <AppearanceForm onClose={() => onOpenChange(false)} />
            </Dialog.Content>
        </Dialog>
    );
}
