declare namespace Signin.Social {
    type Props = {
        authorizationRequest: Nullable<string>;

        onPendingChange(pending: boolean): void;
    };
}
