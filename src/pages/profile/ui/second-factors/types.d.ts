declare namespace SecondFactors {
    namespace Actions {
        type Props = {
            factor: Factor;

            onVerify: Complete.Signature;
            onRemove: Complete.Signature;
        };
    }

    namespace Dialog {
        type Props = {
            state: DialogState;

            onChange: Change.Signature;
            onClose: Complete.Signature;
        };
    }

    namespace SetupPanel {
        type Props = {
            factor?: Factor;
            setup?: Setup;

            onVerified: Verified.Signature;
        };
    }

    namespace Recovery {
        type Props = {
            code: string;

            onComplete: Complete.Signature;
        };
    }

    namespace Remove {
        type Props = {
            factor: Factor;

            onRemoved: Complete.Signature;
        };
    }
}
