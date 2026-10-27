import { useReducer } from "react";

import { SigninOTPStep, SigninOTPAction } from "./enums";

export function useSigninOTP() {
    const [state, dispatch] = useReducer(signinOTPReducer, { step: SigninOTPStep.REQUEST, identifier: "" });
    return { state, dispatch };
}

function signinOTPReducer(state: SigninOTP.State, action: SigninOTP.Action): SigninOTP.State {
    switch (action.type) {
        case SigninOTPAction.VERIFY:
            return { step: SigninOTPStep.VERIFICATION, identifier: action.identifier };
        case SigninOTPAction.BACK:
            return { step: SigninOTPStep.REQUEST, identifier: state.identifier };
        default:
            return state;
    }
}
