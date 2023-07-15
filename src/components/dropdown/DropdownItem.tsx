import BlurCircularOutlinedIcon from "@mui/icons-material/BlurCircularOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { green } from "@mui/material/colors";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import React, { useCallback } from "react";

export interface DropdownItemProps {
    disabled: boolean;
    icon: React.ReactElement | null;
    id: string;
    onClick: (id: string) => void;
    showCheckIcon?: boolean;
    content: string | React.ReactElement;
}

export const DropdownItem = function ({
    disabled = false,
    icon = null,
    id,
    onClick,
    showCheckIcon = false,
    content,
}: DropdownItemProps) {
    const onItemClick = useCallback(() => onClick(id), [id]);

    return (
        <MenuItem id={id} disabled={disabled} onClick={onItemClick}>
            <ListItemIcon>{icon || <BlurCircularOutlinedIcon />}</ListItemIcon>
            <ListItemText
                primaryTypographyProps={{ variant: "caption", color: "text.primary" }}
                className="DropdownItemText"
            >
                {content}
            </ListItemText>
            {showCheckIcon ? <CheckIcon htmlColor={green[500]} fontSize="large" /> : null}
        </MenuItem>
    );
};
