import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
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
            return (
                <Button key={text} onClick={onClick}>
                    {text}
                </Button>
            );
        });
    };

    useImperativeHandle(
        ref,
        () => {
            return { open: handleOpen, close: handleClose };
        },
        [],
    );

    return (
        <Dialog
            open={isOpened}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
            </DialogContent>
            <DialogActions>{renderButtons()}</DialogActions>
        </Dialog>
    );
});

export default AlertDialog;
