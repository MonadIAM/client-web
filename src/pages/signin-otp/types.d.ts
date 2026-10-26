declare namespace SigninOTP {
    namespace Request {
        type Props = {
            authorizationRequest: Nullable<string>;
            identifier: string;

            onRequested(identifier: string): void;
        };
    }

    namespace Verify {
        type Props = {
            authorizationRequest: Nullable<string>;
        };
    }
}
