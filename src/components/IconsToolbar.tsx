import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon";
import NestedDropdown, {
    NestedDropdownAction,
    NestedDropdownProps,
} from "@exabyte-io/cove.js/dist/mui/components/nested-dropdown/NestedDropdown";
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";
import ButtonGroup from "@mui/material/ButtonGroup";
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
}
interface IconToolbarProps {
    handleToggleInteractive: () => void;
    isInteractive: boolean;
    toolbarConfig: ToolbarConfig[];
}

function IconsToolbar(props: IconToolbarProps) {
    const { isInteractive, handleToggleInteractive, toolbarConfig } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const toolbarStyle = {
        position: "absolute",
        top: "25px",
        left: "25px",
        boxShadow: theme.shadows[4],
    };

    const paperSx: SxProps = {
        marginLeft: theme.spacing(2),
        boxShadow: theme.shadows[4],
    };

    return (
        <ButtonGroup
            key="toolbar-button-group"
            orientation="vertical"
            sx={toolbarStyle}
            variant="outlined"
            color="secondary"
        >
            <SquareIconButton
                key="toggle-interactive"
                title="Interactive"
                data-name="Interactive"
                onClick={handleToggleInteractive}
            >
                {isInteractive ? (
                    <IconByName name="close" sx={{ color: theme.palette.warning.main }} />
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
                                paperPlacement="right-start"
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
    );
}

export default IconsToolbar;
