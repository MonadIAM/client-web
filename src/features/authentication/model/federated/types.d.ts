declare namespace Signin.Social {
    type Props = {
        authorizationRequest: Nullable<string>;
        disabled: boolean;

        onPendingChange(pending: boolean): void;
    };
}
