declare namespace Auth.Permission {
    type Map = API.AccessControl.Privileges["data"];

    type Access = Map[string][number];

    type Scope = Access["scope"];

    namespace Match {
        type Options = {
            codes?: string | readonly string[];
            match?: "all" | "any";
            realm?: string;
            scope?: Scope;
        };

        type Props = {
            permissions: Map;
            options: Options;
        };

        type Result = boolean;
    }

    namespace CheckAccess {
        type Props = {
            access: Access;
            options: Match.Options;
        };

        type Result = boolean;
    }
}
