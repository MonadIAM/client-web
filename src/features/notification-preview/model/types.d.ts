declare namespace NotificationPreviewView {
    namespace UseStream {
        type Result = {
            isError: boolean;

            retry: Notifications.Stream.WorkerClient.Retry.Signature;
        };

        type Signature = () => Result;
    }

    namespace UseTitle {
        type Props = string;

        type Result = string;

        type Signature = (props: Props) => Result;
    }
}
