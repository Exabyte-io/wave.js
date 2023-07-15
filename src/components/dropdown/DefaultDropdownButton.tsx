import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import Button from "@mui/material/Button";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import React from "react";

const useStyles = ({ fullWidth }: { fullWidth: boolean }) =>
    makeStyles((theme: Theme) => {
        return {
            root: {
                textTransform: "none",
                justifyContent: "space-between",
                display: "flex",
                flexDirection: "row",
                minWidth: 200,
                color: theme.palette.text.secondary,
                ...(fullWidth ? { width: "100%" } : {}),
            },
        };
    });

export interface DefaultDropdownButtonProps {
    id?: string;
    onClick?: () => void;
    disabled: boolean;
    children: React.ReactNode;
    fullWidth: boolean;
}

export const DefaultDropdownButton = function ({
    onClick,
    disabled = false,
    id = "",
    children = "Button",
    fullWidth = false,
}: DefaultDropdownButtonProps) {
    const classes = useStyles({ fullWidth })();

    return (
        <Button
            id={id}
            className={classes.root}
            disabled={disabled}
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="outlined"
            size="small"
            endIcon={<ArrowDropDownOutlinedIcon color="action" />}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};

export default DefaultDropdownButton;
