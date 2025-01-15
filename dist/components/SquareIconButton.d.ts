import { IconButtonProps } from "@mui/material/IconButton";
import { TooltipProps } from "@mui/material/Tooltip";
import React from "react";
interface SquareIconButtonProps extends IconButtonProps {
    title: string;
    id?: string;
    label?: string;
    onClick: (...args: React.MouseEvent[]) => void;
    tooltipPlacement?: TooltipProps["placement"];
    isToggleable?: boolean;
}
/**
 * Square icon button with toggle logic
 */
declare function SquareIconButton(props: SquareIconButtonProps): import("react/jsx-runtime").JSX.Element;
export default SquareIconButton;
