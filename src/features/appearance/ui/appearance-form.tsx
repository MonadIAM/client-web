import { Button, Dialog, Field, Form, Radio } from "@monadiam/ui-kit";
import { ThemeMode } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { Language } from "~shared/i18n";

import { useAppearanceForm } from "../model/use-appearance.form";
import { ThemePreview } from "./theme-preview";
import { appearanceStyles } from "./styles";

export function AppearanceForm({ onClose }: Appearance.FormProps) {
    const { t } = useTranslation();
    const { form, theme, isSubmitting, canSubmit } = useAppearanceForm({ onClose });

    return (
        <Form form={form} aria-label={t("appearance.title")}>
            <Form.Fields className={appearanceStyles.fields}>
                <Field.Select
                    form={form}
                    name="language"
                    reserveErrorSpace={false}
                    label={t("appearance.language")}
                    disabled={isSubmitting}
                    options={[
                        { value: Language.RU, label: "Русский" },
                        { value: Language.EN, label: "English" },
                    ]}
                />
                <Radio.Group
                    name={theme.name}
                    label={t("appearance.theme")}
                    value={theme.state.value}
                    onValueChange={theme.handleChange}
                    onBlur={theme.handleBlur}
                    disabled={isSubmitting}
                    className={appearanceStyles.themes}>
                    <Radio
                        value={ThemeMode.LIGHT}
                        label={t("appearance.light")}
                        preview={<ThemePreview mode={ThemeMode.LIGHT} />}
                    />
                    <Radio
                        value={ThemeMode.DARK}
                        label={t("appearance.dark")}
                        preview={<ThemePreview mode={ThemeMode.DARK} />}
                    />
                    <Radio value="system" label={t("appearance.system")} preview={<ThemePreview mode="system" />} />
                </Radio.Group>
            </Form.Fields>
            <Dialog.Actions>
                <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
                    {t("common.save")}
                </Button>
            </Dialog.Actions>
        </Form>
    );
}
