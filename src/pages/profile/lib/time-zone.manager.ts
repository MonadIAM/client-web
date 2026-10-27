class Manager implements ProfileTimeZone.Contract {
    public static readonly instance = new Manager();

    private constructor() {}

    public getOptions(props: ProfileTimeZone.GetOptions.Props): ProfileTimeZone.GetOptions.Result {
        const { locale, current } = props;
        const supportedTimeZones = Intl.supportedValuesOf("timeZone");
        const timeZones = new Set(["UTC", current, ...supportedTimeZones]);
        const date = new Date();

        const options = Array.from(timeZones, (timeZone) => this.createOption({ timeZone, locale, date }));

        options.sort((first, second) => {
            const offsetDifference = first.offsetMinutes - second.offsetMinutes;

            if (offsetDifference) {
                return first.value.localeCompare(second.value);
            } else {
                return offsetDifference;
            }
        });

        return options;
    }

    public formatName(props: ProfileTimeZone.FormatName.Props): ProfileTimeZone.FormatName.Result {
        const { timeZone, locale, date, style } = props;
        const formatter = new Intl.DateTimeFormat(locale, {
            timeZoneName: style,
            timeZone,
        });
        const parts = formatter.formatToParts(date);
        const timeZonePart = parts.find((part) => part.type === "timeZoneName");

        return timeZonePart?.value;
    }

    public getOffsetMinutes({ offset }: ProfileTimeZone.GetOffsetMinutes.Props): ProfileTimeZone.GetOffsetMinutes.Result {
        const match = /^GMT([+-])(\d{2}):(\d{2})$/u.exec(offset);
        let offsetMinutes = 0;

        if (match) {
            const [, sign, hours, minutes] = match;
            const absoluteMinutes = Number(hours) * 60 + Number(minutes);

            offsetMinutes = sign === "-" ? -absoluteMinutes : absoluteMinutes;
        }

        return offsetMinutes;
    }

    public createOption(props: ProfileTimeZone.CreateOption.Props): ProfileTimeZone.CreateOption.Result {
        const { timeZone, locale, date } = props;
        const offset = this.formatName({ timeZone, locale: "en", date, style: "longOffset" }) ?? "GMT";
        const localizedName = this.formatName({ timeZone, locale, date, style: "longGeneric" }) ?? timeZone;
        const offsetMinutes = this.getOffsetMinutes({ offset });

        const citySegment = timeZone.split("/").at(-1) ?? timeZone;
        const cityName = citySegment.replaceAll("_", " ");
        const utcOffset = offset === "GMT" ? "UTC+00:00" : offset.replace("GMT", "UTC");

        return {
            value: timeZone,
            label: `${utcOffset} · ${cityName}`,
            description: `${timeZone} — ${localizedName}`,
            offsetMinutes,
        };
    }
}

export const TimeZoneManager: ProfileTimeZone.PublicContract = Manager.instance;
