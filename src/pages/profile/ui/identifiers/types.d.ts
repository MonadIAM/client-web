declare namespace Identifiers {
    namespace Content {
        type Props = {
            identifier: Identifier;
        };
    }

    namespace Actions {
        type Props = {
            identifier: Identifier;

            onVerify: Complete.Signature;
            onRemove: Complete.Signature;
        };
    }

    namespace Dialog {
        type Props = {
            state: DialogState;

            onClose: Complete.Signature;
            onChange: ChangeDialog.Signature;
        };
    }
}
