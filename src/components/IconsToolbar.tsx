import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon";
import NestedDropdown, {
    NestedDropdownAction,
    NestedDropdownProps,
} from "@exabyte-io/cove.js/dist/mui/components/nested-dropdown/NestedDropdown";
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";
import { SxProps, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";

import SquareIconButton from "./SquareIconButton";

interface ToolbarConfig {
    id: string;
    key?: string;
    title: string;
    header?: string;
    onClick: (...args: React.MouseEvent[]) => void;
    leftIcon: React.ReactNode;
    actions?: NestedDropdownAction[];
    contentObject?: NestedDropdownProps["contentObject"];
    paperPlacement?: NestedDropdownProps["paperPlacement"];
}
interface IconToolbarProps {
    handleToggleInteractive: () => void;
    isInteractive: boolean;
    toolbarConfig: ToolbarConfig[];
    paperPlacement?: NestedDropdownProps["paperPlacement"];
}

function IconsToolbar(props: IconToolbarProps) {
    const { isInteractive, handleToggleInteractive, toolbarConfig } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const toolbarStyle = {
        position: "absolute",
        top: "1em",
        left: "1em",
        boxShadow: theme.shadows[4],
    };

    const paperSx: SxProps = {
        marginLeft: theme.spacing(1),
        boxShadow: theme.shadows[4],
    };

    return (
        <Paper elevation={2}>
            <ButtonGroup
                key="toolbar-button-group"
                orientation="vertical"
                sx={toolbarStyle}
                variant="outlined"
                color="inherit"
            >
                <SquareIconButton
                    key="toggle-interactive"
                    size="large"
                    title="Interactive"
                    data-name="Interactive"
                    onClick={handleToggleInteractive}
                >
                    {isInteractive ? (
                        <IconByName
                            name="actions.close"
                            sx={{ color: theme.palette.warning.main }}
                        />
                    ) : (
                        <PowerSettingsNew />
                    )}
                </SquareIconButton>
                {isInteractive &&
                    toolbarConfig.map((config) => {
                        if (config.actions || config.contentObject) {
                            return (
                                <NestedDropdown
                                    /* eslint-disable-next-line react/jsx-props-no-spreading */
                                    {...config}
                                    actions={config.actions}
                                    contentObject={config.contentObject}
                                    key={config.key || config.id}
                                    data-name={config.id}
                                    paperPlacement={config.paperPlacement || "right-start"}
                                    paperSx={paperSx}
                                    isMobile={isMobile}
                                >
                                    <SquareIconButton
                                        data-name={config.id}
                                        key={`button-${config.key}` || `button-${config.id}`}
                                        title={config.title}
                                        onClick={config.onClick}
                                    >
                                        {config.leftIcon}
                                    </SquareIconButton>
                                </NestedDropdown>
                            );
                        }
                        const { id, key, title, onClick, leftIcon } = config;
                        return (
                            <SquareIconButton
                                key={key || id}
                                data-name={id}
                                title={title}
                                onClick={onClick}
                            >
                                {leftIcon}
                            </SquareIconButton>
                        );
                    })}
            </ButtonGroup>
        </Paper>
    );
}

export default IconsToolbar;
