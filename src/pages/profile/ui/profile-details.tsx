import { CameraIcon, CopyIcon, CheckIcon } from "@monadiam/ui-kit/icons";
import { useTranslation } from "react-i18next";
import { Fragment, useMemo } from "react";
import {
    FlexJustification,
    FormDirection,
    ButtonVariant,
    ButtonSize,
    FlexAlignment,
    BadgeTone,
    TextSize,
} from "@monadiam/ui-kit/enums";
import { List, Section, Avatar, Button, Dialog, Badge, Field, Flex, Form, Text } from "@monadiam/ui-kit";

import { Language } from "~shared/i18n";

import { TimeZoneManager } from "../lib/time-zone.manager";
import { useProfileForm } from "../model/use-profile.form";
import { useProfileCopy } from "../model/use-profile-copy";
import { pageStyles } from "./styles";

const accountStatusTones = {
    ACTIVE: BadgeTone.SUCCESS,
    PENDING: BadgeTone.WARNING,
    SUSPENDED: BadgeTone.DANGER,
    DEACTIVATED: BadgeTone.NEUTRAL,
} satisfies ProfileDetails.StatusTones;

export function ProfileDetails({ account }: ProfileDetails.Props) {
    const { t, i18n } = useTranslation();
    const { form, isSubmitting, canSubmit } = useProfileForm(account);
    const { copied, copy } = useProfileCopy({ value: account.id });

    const copyLabel = copied ? t("common.copied") : t("profile.copyId");
    const CopyStatusIcon = copied ? CheckIcon : CopyIcon;
    const locale = i18n.resolvedLanguage ?? Language.EN;
    const currentZone = account.profile?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zones = useMemo(() => TimeZoneManager.getOptions({ locale, current: currentZone }), [locale, currentZone]);

    return (
        <Fragment>
            <Section title={t("profile.details")} description={t("profile.detailsDescription")}>
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
                                aria-label={t("profile.changePhoto")}>
                                <Avatar
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
                                    <CameraIcon className={pageStyles.avatarIcon} />
                                    <Text.Span>{t("profile.changePhoto")}</Text.Span>
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
            </Section>
            <Section title={t("profile.account")} description={t("profile.accountDescription")}>
                <List
                    items={[
                        {
                            id: "id",
                            label: t("profile.id"),
                            content: (
                                <Text.Span size={TextSize.XS} className={pageStyles.identifier}>
                                    {account.id}
                                </Text.Span>
                            ),
                            action: (
                                <Button
                                    type="button"
                                    variant={ButtonVariant.GHOST}
                                    size={ButtonSize.ICON_EXTRA_SMALL}
                                    icon={<CopyStatusIcon aria-hidden="true" className={pageStyles.copyIcon} />}
                                    aria-label={copyLabel}
                                    title={copyLabel}
                                    onClick={() => void copy()}>
                                    <Text.Span role="status" className={pageStyles.copyStatus}>
                                        {copied ? t("common.copied") : ""}
                                    </Text.Span>
                                </Button>
                            ),
                        },
                        {
                            id: "subject",
                            label: t("profile.subject"),
                            content: <Text.Span>{t(`profile.subjects.${account.subject}`)}</Text.Span>,
                        },
                        {
                            id: "status",
                            label: t("profile.status"),
                            content: (
                                <Badge tone={accountStatusTones[account.status]}>
                                    {t(`profile.statuses.${account.status}`)}
                                </Badge>
                            ),
                        },
                        {
                            id: "created",
                            label: t("profile.createdAt"),
                            content: (
                                <Text.Span>
                                    {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                        timeZone: account.profile?.timeZone ?? undefined,
                                    }).format(account.createdAt)}
                                </Text.Span>
                            ),
                        },
                    ]}
                />
            </Section>
        </Fragment>
    );
}
