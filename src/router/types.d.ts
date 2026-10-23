declare namespace Router {
    type Props = {
        initialization: Promise<void>;
    };

    type NotFoundProps = {
        rootPath: string;
    };
}
