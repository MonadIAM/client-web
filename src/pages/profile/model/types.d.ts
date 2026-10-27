declare namespace ProfileCopy {
    type Props = {
        value: string;
    };

    type Result = {
        copied: boolean;
        copy: Copy.Signature;
    };

    type Signature = (props: Props) => Result;

    namespace Copy {
        type Result = Promise<void>;

        type Signature = () => Result;
    }
}
