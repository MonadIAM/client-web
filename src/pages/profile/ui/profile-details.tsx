import { Avatar, Button, Dialog, Field, Flex, Form } from "@monadiam/ui-kit";
import { TrashIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { FlexJustification, FormDirection, FormAlignment, ButtonVariant, ButtonSize } from "@monadiam/ui-kit/enums";

import { Language } from "~shared/i18n";

import { TimeZoneManager } from "../lib/time-zone.manager";
import { useProfileForm } from "../model/use-profile.form";
import { pageStyles } from "./styles";

export function ProfileDetails({ account }: ProfileDetails.Props) {
    const { t, i18n } = useTranslation();
    const { form, isSubmitting, canSubmit } = useProfileForm(account);

    const locale = i18n.resolvedLanguage ?? Language.EN;
    const currentZone = account.profile?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zones = useMemo(() => TimeZoneManager.getOptions({ locale, current: currentZone }), [locale, currentZone]);
    const today = new Date();

    return (
        <div className={`${pageStyles.panel} ${pageStyles.details}`}>
            <div className={pageStyles.avatarPanel}>
                <Avatar
                    src={account.profile?.pictureUrl}
                    name={account.profile?.displayName}
                    label={account.profile?.displayName ?? t("profile.title")}
                    className={pageStyles.avatar}
                />
                <Flex.Row gap="0.5rem" justify={FlexJustification.CENTER}>
                    <Dialog>
                        <Dialog.Trigger
                            render={<Button type="button" variant={ButtonVariant.OUTLINE} disabled={isSubmitting} />}>
                            {t("profile.changePhoto")}
                        </Dialog.Trigger>
                        <Dialog.Content
                            title={t("profile.changePhoto")}
                            description={t("profile.photoNotImplemented")}
                            closeLabel={t("common.close")}
                        />
                    </Dialog>
                    <Button
                        type="button"
                        variant={ButtonVariant.DESTRUCTIVE}
                        size={ButtonSize.ICON_LARGE}
                        aria-label={t("profile.removePhoto")}
                        title={t("profile.removePhoto")}
                        disabled>
                        <TrashIcon />
                    </Button>
                </Flex.Row>
            </div>
            <Form form={form} aria-label={t("profile.details")} className={pageStyles.detailsForm}>
                <Form.Fields>
                    <div className={pageStyles.detailsGrid}>
                        <Field.Text
                            form={form}
                            name="displayName"
                            label={t("profile.displayName")}
                            autoComplete="name"
                            disabled={isSubmitting}
                            validators={{
                                onBlur: ({ value }) => (value.trim() ? undefined : t("validation.required")),
                            }}
                        />
                        <Field.Select
                            form={form}
                            name="timeZone"
                            label={t("profile.timeZone")}
                            options={zones}
                            searchable
                            searchLabel={t("profile.searchTimeZone")}
                            emptyLabel={t("profile.noTimeZones")}
                            disabled={isSubmitting}
                        />
                        <Field.Select
                            form={form}
                            name="gender"
                            label={t("profile.gender.label")}
                            options={[
                                { value: "", label: t("profile.gender.unspecified") },
                                { value: "male", label: t("profile.gender.male") },
                                { value: "female", label: t("profile.gender.female") },
                                { value: "nonbinary", label: t("profile.gender.nonbinary") },
                            ]}
                            searchable
                            searchLabel={t("profile.gender.search")}
                            emptyLabel={t("profile.gender.empty")}
                            customValueLabel={t("profile.gender.custom")}
                            disabled={isSubmitting}
                        />
                        <Field.Date
                            form={form}
                            name="birthDate"
                            label={t("profile.birthDate")}
                            locale={locale}
                            placeholder={t("profile.chooseDate")}
                            clearLabel={t("profile.clearDate")}
                            max={today}
                            disabled={isSubmitting}
                        />
                    </div>
                </Form.Fields>
                <Form.Actions direction={FormDirection.HORIZONTAL} align={FormAlignment.END}>
                    <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
                        {t("common.save")}
                    </Button>
                </Form.Actions>
            </Form>
        </div>
    );
}
