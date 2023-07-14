import { ListItemIcon, ListItemText } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

export interface ToolbarMenuItemProps {
    leftElement?: React.ReactNode;
    title?: string;
    rightElement?: React.ReactNode;
}

const ToolbarMenuItem = function ({ leftElement, title, rightElement }: ToolbarMenuItemProps) {
    return (
        <MenuItem>
            {leftElement && <ListItemIcon>{leftElement}</ListItemIcon>}
            {title && <ListItemText>{title}</ListItemText>}
            {rightElement}
        </MenuItem>
    );
};

export default ToolbarMenuItem;
