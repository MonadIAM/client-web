declare namespace Authentication {
    namespace Form {
        type Props = { authorizationRequest: Nullable<string> };
    }

    namespace Continue {
        type Props = {
            authorizationRequest?: Nullable<string>;
            response: unknown;
        };

        type Result = Promise<void>;

        type Signature = (props: Props) => Result;
    }
}
