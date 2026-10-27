declare namespace Sessions {
    namespace Content {
        type Props = {
            current?: boolean;
            session: Session;
        };
    }

    namespace Dialog {
        type Props = {
            target: Revoke.Target;
            currentId: string;

            onClose: Complete.Signature;
        };
    }
}
