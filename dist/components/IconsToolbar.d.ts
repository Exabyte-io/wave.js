import { NestedDropdownAction, NestedDropdownProps } from "@mat3ra/cove.js/dist/mui/components/nested-dropdown/NestedDropdown";
import React from "react";
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
declare function IconsToolbar(props: IconToolbarProps): import("react/jsx-runtime").JSX.Element;
export default IconsToolbar;
