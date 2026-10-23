import { CenteredViewport, Spinner } from "@monadiam/ui-kit";
import { JSX } from "react";

export function Loading(): JSX.Element {
    return (
        <CenteredViewport>
            <Spinner />
        </CenteredViewport>
    );
}
