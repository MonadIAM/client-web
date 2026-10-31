import { ButtonSize, ButtonVariant } from "@monadiam/ui-kit/enums";
import { RefreshIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";
import { Button } from "@monadiam/ui-kit";

export function RetryButton({ loading, onClick }: RetryButton.Props) {
    const { t } = useTranslation();

    return (
        <Button
            type="button"
            variant={ButtonVariant.OUTLINE}
            size={ButtonSize.ICON_SMALL}
            loading={loading}
            aria-label={t("common.retryLoading")}
            title={t("common.retryLoading")}
            onClick={onClick}>
            {!loading && <RefreshIcon aria-hidden="true" />}
        </Button>
    );
}
