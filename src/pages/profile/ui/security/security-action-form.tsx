import { useSecurityConfirmationForm } from "../../model/security/use-security-confirmation.form";
import { SecurityActionAuthentication } from "./security-action-authentication";
import { SecurityActionConfirmation } from "./security-action-confirmation";

export function SecurityActionForm(props: Security.Action.Props) {
    const { form, pending, authenticationRequired, authenticate } = useSecurityConfirmationForm(props);

    if (authenticationRequired) {
        return <SecurityActionAuthentication {...props} onComplete={authenticate} />;
    } else {
        return <SecurityActionConfirmation {...props} form={form} pending={pending} />;
    }
}
