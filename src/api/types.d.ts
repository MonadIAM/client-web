import * as AccessControlTypes from "./generated/access-control";
import * as NotificationTypes from "./generated/notification";
import * as OrganizationTypes from "./generated/organization";
import * as IdentityTypes from "./generated/identity";
import * as HrTypes from "./generated/hr";

declare global {
    namespace API {
        export import AccessControl = AccessControlTypes;
        export import Notification = NotificationTypes;
        export import Organization = OrganizationTypes;
        export import Identity = IdentityTypes;
        export import Hr = HrTypes;
    }
}
