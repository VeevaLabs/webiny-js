import * as React from "react";
import { useSecurity } from "~/hooks/useSecurity";
import { SecureRouteErrorPlugin } from "~/types";
import { plugins } from "@webiny/plugins";

export default ({
    children,
    permission
}: {
    children: any;
    permission?: string;
}): React.ReactElement => {
    const security = useSecurity();

    if (!security) {
        return null;
    }

    const { identity } = security;

    if (!identity) {
        return null;
    }

    let hasPermission = false;
    if (identity) {
        hasPermission = permission ? Boolean(identity.getPermission(permission)) : true;
    }

    if (hasPermission) {
        return children;
    }

    const plugin = plugins.byName<SecureRouteErrorPlugin>("secure-route-error");
    if (!plugin) {
        return null;
    }

    return plugin.render();
};
