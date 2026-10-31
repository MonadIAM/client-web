import { Avatar, Button, Dialog, Field, Flex, Form } from "@monadiam/ui-kit";
import { PencilIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { FlexJustification, FormDirection, ButtonVariant, FlexAlignment } from "@monadiam/ui-kit/enums";

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

    return (
        <Form form={form} aria-label={t("profile.details")}>
            <div className={pageStyles.details}>
                <Form.Fields>
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
                </Form.Fields>
                <Dialog>
                    <Dialog.Trigger
                        type="button"
                        className={pageStyles.avatarFrame}
                        title={t("profile.changePhoto")}
                        aria-label={t("profile.changePhoto")}>
                        <Avatar
                            src={account.profile?.pictureUrl}
                            name={account.profile?.displayName}
                            label={account.profile?.displayName ?? t("profile.title")}
                            className={pageStyles.avatar}
                        />
                        <Flex.Col
                            render={<span />}
                            aria-hidden="true"
                            align={FlexAlignment.CENTER}
                            justify={FlexJustification.CENTER}
                            className={pageStyles.avatarOverlay}>
                            <PencilIcon className={pageStyles.avatarIcon} />
                        </Flex.Col>
                    </Dialog.Trigger>
                    <Dialog.Content
                        title={t("profile.changePhoto")}
                        description={t("profile.photoNotImplemented")}
                        closeLabel={t("common.close")}>
                        <Flex.Row justify={FlexJustification.END}>
                            <Dialog.Close render={<Button variant={ButtonVariant.OUTLINE} />}>
                                {t("common.close")}
                            </Dialog.Close>
                        </Flex.Row>
                    </Dialog.Content>
                </Dialog>
            </div>
            <Form.Actions direction={FormDirection.HORIZONTAL}>
                <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
                    {t("common.save")}
                </Button>
            </Form.Actions>
        </Form>
    );
}
