import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import React from "react";

const defaultFormControlStyle = { margin: "15px", size: "small" };
const defaultFormLabelStyle = { padding: "5px" };
const defaultTextFieldStyle = {
    height: "25px",
    width: "75px",
    "& input": {
        height: "30px",
        margin: "0px",
        padding: "5px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
};

export interface InputWithLabelProps {
    label: string;
    id: string;
    value: number;
    max?: number;
    min?: number;
    step?: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    formControlProps?: React.ComponentProps<typeof FormControl>;
    formLabelProps?: React.ComponentProps<typeof FormLabel>;
    textFieldProps?: React.ComponentProps<typeof TextField>;
}

function InputWithLabel(props: InputWithLabelProps) {
    const {
        label,
        id,
        value,
        max,
        min,
        step,
        onChange,
        className,
        formControlProps,
        formLabelProps,
        textFieldProps,
    } = props;

    return (
        <FormControl
            key={`form-control-${id}`}
            sx={{ ...defaultFormControlStyle, ...formControlProps }}
        >
            <FormLabel htmlFor={id} sx={{ ...defaultFormLabelStyle, ...formLabelProps }}>
                {label}
            </FormLabel>
            <TextField
                type="number"
                className={className}
                id={id}
                value={value}
                onChange={onChange}
                sx={{ ...defaultTextFieldStyle, ...textFieldProps }}
                inputProps={{
                    max,
                    min,
                    step,
                }}
            />
        </FormControl>
    );
}

export default InputWithLabel;
