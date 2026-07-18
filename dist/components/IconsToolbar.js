import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon";
import NestedDropdown from "@mat3ra/cove/dist/mui/components/nested-dropdown/NestedDropdown";
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SquareIconButton from "./SquareIconButton";
function IconsToolbar(props) {
    const { isInteractive, handleToggleInteractive, toolbarConfig } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const toolbarStyle = {
        position: "absolute",
        top: "1em",
        left: "1em",
        boxShadow: theme.shadows[4],
    };
    const paperSx = {
        marginLeft: theme.spacing(1),
        boxShadow: theme.shadows[4],
    };
    return (_jsx(Paper, { elevation: 2, children: _jsxs(ButtonGroup, { orientation: "vertical", sx: toolbarStyle, variant: "outlined", color: "inherit", children: [_jsx(SquareIconButton, { size: "large", title: "Interactive", "data-name": "Interactive", onClick: handleToggleInteractive, children: isInteractive ? (_jsx(IconByName, { name: "actions.close", sx: { color: theme.palette.warning.main } })) : (_jsx(PowerSettingsNew, {})) }, "toggle-interactive"), isInteractive &&
                    toolbarConfig.map((config) => {
                        if (config.actions || config.contentObject) {
                            return (_createElement(NestedDropdown
                            /* eslint-disable-next-line react/jsx-props-no-spreading */
                            , { ...config, actions: config.actions, contentObject: config.contentObject, key: config.key || config.id, "data-name": config.id, paperPlacement: config.paperPlacement || "right-start", paperSx: paperSx, isMobile: isMobile },
                                _jsx(SquareIconButton, { "data-name": config.id, title: config.title, onClick: config.onClick, children: config.leftIcon }, `button-${config.key}` || `button-${config.id}`)));
                        }
                        const { id, key, title, onClick, leftIcon } = config;
                        return (_jsx(SquareIconButton, { "data-name": id, title: title, onClick: onClick, children: leftIcon }, key || id));
                    })] }, "toolbar-button-group") }));
}
export default IconsToolbar;
