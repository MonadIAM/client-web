import type { UI } from "@monadiam/ui-kit";

declare global {
    namespace ProfileTimeZone {
        type NameStyle = "longOffset" | "longGeneric";

        type Option = UI.Field.Select.Option & {
            offsetMinutes: number;
        };

        interface Contract extends PublicContract, PrivateContract {}

        interface PublicContract {
            getOptions: GetOptions.Signature;
        }

        namespace GetOptions {
            type Props = {
                locale: string;
                current: string;
            };

            type Result = UI.Field.Select.Option[];

            type Signature = (props: Props) => Result;
        }

        interface PrivateContract {
            getOffsetMinutes: GetOffsetMinutes.Signature;
            createOption: CreateOption.Signature;
            formatName: FormatName.Signature;
        }

        namespace FormatName {
            type Props = {
                timeZone: string;
                locale: string;
                date: Date;
                style: NameStyle;
            };

            type Result = Optional<string>;

            type Signature = (props: Props) => Result;
        }

        namespace GetOffsetMinutes {
            type Props = {
                offset: string;
            };

            type Result = number;

            type Signature = (props: Props) => Result;
        }

        namespace CreateOption {
            type Props = {
                timeZone: string;
                locale: string;
                date: Date;
            };

            type Result = Option;

            type Signature = (props: Props) => Result;
        }
    }
}
