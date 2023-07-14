import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import React from "react";

interface ToolbarMenuProps {
    children: React.ReactNode;
}

const ToolbarMenu = function ({ children }: ToolbarMenuProps) {
    return (
        <Paper sx={{ width: "320px" }} data-name="toolbar-menu">
            <MenuList>{children}</MenuList>);
        </Paper>
    );
};

export default ToolbarMenu;
