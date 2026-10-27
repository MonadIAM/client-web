import { Button, Dialog, Field, Form, Radio } from "@monadiam/ui-kit";
import { ButtonVariant, FormAlignment, FormDirection, FormSpacing, ThemeMode } from "@monadiam/ui-kit/enums";
import { useTranslation } from "react-i18next";

import { Language } from "~shared/i18n";

import { useAppearanceForm } from "../model/use-appearance.form";
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
                    disabled={isSubmitting}>
                    <Radio value={ThemeMode.LIGHT} label={t("appearance.light")} />
                    <Radio value={ThemeMode.DARK} label={t("appearance.dark")} />
                    <Radio value="system" label={t("appearance.system")} />
                </Radio.Group>
            </Form.Fields>
            <Form.Actions
                direction={FormDirection.HORIZONTAL}
                align={FormAlignment.END}
                spacing={FormSpacing.LARGE}
                gap={FormSpacing.SMALL}
                className={appearanceStyles.actions}>
                <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />} disabled={isSubmitting}>
                    {t("common.cancel")}
                </Dialog.Close>
                <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
                    {t("common.save")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
