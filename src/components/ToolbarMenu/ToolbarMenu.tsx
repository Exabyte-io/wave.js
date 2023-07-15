import NestedDropdown, {
    NestedDropdownAction,
} from "@exabyte-io/cove.js/dist/mui/components/nested-dropdown/NestedDropdown";
import ListItemIcon from "@mui/material/ListItemIcon";
import React from "react";

interface ToolbarMenuProps {
    actions: NestedDropdownAction[];
    icon: JSX.Element;
    title: string;
}

const ToolbarMenu = function ({ actions, icon, title }: ToolbarMenuProps) {
    return (
        <NestedDropdown actions={actions} title={title}>
            <ListItemIcon>{icon}</ListItemIcon>
        </NestedDropdown>
    );
};

export default ToolbarMenu;
