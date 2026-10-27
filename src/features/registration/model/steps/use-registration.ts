import { useReducer } from "react";

import { SignupStep, SignupAction } from "./enums";

export function useRegistration() {
    const [state, dispatch] = useReducer(registrationReducer, { step: SignupStep.REGISTRATION, identifier: "" });
    return { state, dispatch };
}

function registrationReducer(state: Signup.State, action: Signup.Action): Signup.State {
    switch (action.type) {
        case SignupAction.VERIFY:
            return { step: SignupStep.VERIFICATION, identifier: action.identifier };
        case SignupAction.BACK:
            return { step: SignupStep.REGISTRATION, identifier: action.identifier };
        case SignupAction.COMPLETE:
            return { step: SignupStep.RECOVERY, codes: action.codes };
        default:
            return state;
    }
}
