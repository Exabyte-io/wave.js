import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
function ParametersMenu(props) {
    const { viewerSettings, handleCellRepetitionsChange, handleSphereRadiusChange, handleChemicalConnectivityFactorChange, } = props;
    return (_jsxs(Stack, { spacing: 1.5, margin: 2, children: [_jsx(Typography, { variant: "body1", children: "Atomic radius" }), _jsx(Box, { children: _jsx(TextField, { fullWidth: true, label: "Value", type: "number", size: "small", className: "inverse stepper sphere-radius", id: "sphere-radius", value: viewerSettings.atomRadiiScale, onChange: handleSphereRadiusChange, inputProps: {
                        max: 10,
                        min: 0.1,
                        step: 0.1,
                    } }) }), _jsx(Typography, { variant: "body1", children: "Repetition along vectors:" }), _jsx(Stack, { direction: "row", spacing: 1, children: ["A", "B", "C"].map((label) => {
                    const key = `repetitionsAlongLatticeVector${label}`;
                    return (_jsx(Box, { children: _jsx(TextField, { label: label, size: "small", type: "number", className: "inverse stepper cell-repetitions", id: `repetitionsAlongLatticeVector${label}`, value: viewerSettings[key], onChange: handleCellRepetitionsChange, inputProps: {
                                max: 10,
                                min: 1,
                                step: 1,
                            } }) }, label));
                }) }, "repetition"), _jsx(Typography, { variant: "body1", children: "Chemical connectivity factor" }), _jsx(Box, { children: _jsx(TextField, { fullWidth: true, size: "small", label: "Value", type: "number", className: "inverse stepper cell-repetitions", id: "chemical-connectivity-factor", value: viewerSettings.chemicalConnectivityFactor, onChange: handleChemicalConnectivityFactorChange, inputProps: {
                        max: 2,
                        min: 0,
                        step: 0.01,
                    } }) })] }));
}
export default ParametersMenu;
