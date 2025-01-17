import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// TODO: move that component to cove.js and reuse it here
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useImperativeHandle, useState } from "react";
export const AlertDialog = React.forwardRef((props, ref) => {
    const [isOpened, setIsOpened] = useState(false);
    const [content, setContent] = useState("");
    const [buttons, setButtons] = useState([]);
    const [title, setTitle] = useState("");
    /* eslint-disable no-shadow */
    const handleOpen = ({ content, buttons = [], title }) => {
        setTitle(title);
        setButtons(buttons);
        setContent(content);
        setIsOpened(true);
    };
    const handleClose = () => {
        setIsOpened(false);
    };
    const renderButtons = () => {
        return buttons.map(({ text, onClick }) => {
            return (_jsx(Button, { onClick: onClick, children: text }, text));
        });
    };
    useImperativeHandle(ref, () => {
        return { open: handleOpen, close: handleClose };
    }, []);
    return (_jsxs(Dialog, { open: isOpened, onClose: handleClose, "aria-labelledby": "alert-dialog-title", "aria-describedby": "alert-dialog-description", children: [_jsx(DialogTitle, { id: "alert-dialog-title", children: title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { id: "alert-dialog-description", children: content }) }), _jsx(DialogActions, { children: renderButtons() })] }));
});
export default AlertDialog;
