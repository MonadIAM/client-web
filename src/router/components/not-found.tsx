import { Button, CenteredViewport } from "@monadiam/ui-kit";
import { useNavigate } from "react-router";
import { JSX } from "react";

export function NotFound({ rootPath }: Router.NotFoundProps): JSX.Element {
    const navigate = useNavigate();

    return (
        <CenteredViewport>
            <div className="grid w-full max-w-lg gap-6 px-6 text-center">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p role="status">The address may be incorrect or the page may have moved.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button type="button" onClick={() => void navigate(rootPath)}>
                        Go to root
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void navigate(-1)}>
                        Go back
                    </Button>
                </div>
            </div>
        </CenteredViewport>
    );
}
