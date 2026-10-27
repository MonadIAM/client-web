import { useReducer } from "react";

import { PasswordRecoveryStep, PasswordRecoveryAction } from "./enums";

export function usePasswordRecovery() {
    const [state, dispatch] = useReducer(passwordRecoveryReducer, { step: PasswordRecoveryStep.REQUEST, identifier: "" });
    return { state, dispatch };
}

function passwordRecoveryReducer(state: PasswordRecovery.State, action: PasswordRecovery.Action): PasswordRecovery.State {
    switch (action.type) {
        case PasswordRecoveryAction.PROCEED:
            return { step: action.method, identifier: action.identifier };
        case PasswordRecoveryAction.BACK:
            return { step: PasswordRecoveryStep.REQUEST, identifier: action.identifier };
        case PasswordRecoveryAction.COMPLETE:
            return { step: PasswordRecoveryStep.COMPLETE };
        default:
            return state;
    }
}
