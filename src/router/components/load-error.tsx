import { Button, CenteredViewport } from "@monadiam/ui-kit";
import { JSX } from "react";

export function LoadError(): JSX.Element {
    return (
        <CenteredViewport>
            <div className="grid w-full max-w-lg gap-6 px-6 text-center">
                <h1 className="text-2xl font-semibold">MonadIAM</h1>
                <p role="alert">Page could not be loaded</p>
                <Button className="mx-auto" type="button" variant="link" onClick={() => location.reload()}>
                    Retry
                </Button>
            </div>
        </CenteredViewport>
    );
}
