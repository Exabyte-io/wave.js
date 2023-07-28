import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

export type ViewerSettings = {
    isViewAdjustable: boolean;
    atomRadiiScale: number;
    repetitionsAlongLatticeVectorA: number;
    repetitionsAlongLatticeVectorB: number;
    repetitionsAlongLatticeVectorC: number;
    chemicalConnectivityFactor: number;
};

interface ParametersMenuProps {
    viewerSettings: ViewerSettings;
    handleSphereRadiusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCellRepetitionsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChemicalConnectivityFactorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ParametersMenu(props: ParametersMenuProps) {
    const {
        viewerSettings,
        handleCellRepetitionsChange,
        handleSphereRadiusChange,
        handleChemicalConnectivityFactorChange,
    } = props;

    const theme = useTheme();
    const defaultTextFieldStyle = {
        "& input": {
            margin: theme.spacing(0.5),
            height: theme.spacing(3),
            padding: theme.spacing(1),
            borderRadius: theme.spacing(0.5),
        },
    };

    return (
        <Stack spacing={theme.spacing(1)} sx={{ margin: theme.spacing(2) }}>
            <Typography variant="subtitle1">Atomic radius</Typography>
            <Box>
                <TextField
                    label="Value"
                    type="number"
                    className="inverse stepper sphere-radius"
                    id="sphere-radius"
                    value={viewerSettings.atomRadiiScale}
                    onChange={handleSphereRadiusChange}
                    sx={defaultTextFieldStyle}
                    inputProps={{
                        max: 10,
                        min: 0.1,
                        step: 0.1,
                    }}
                />
            </Box>
            <Divider />
            <Typography variant="subtitle1">Repetition along vectors:</Typography>
            <Stack key="repetition" direction="row" spacing={theme.spacing(2)}>
                {["A", "B", "C"].map((label) => {
                    return (
                        <Box key={label}>
                            <TextField
                                label={label}
                                type="number"
                                className="inverse stepper cell-repetitions"
                                id={`repetitionsAlongLatticeVector${label}`}
                                value={
                                    (viewerSettings as { [key: string]: any })[
                                        `repetitionsAlongLatticeVector${label}`
                                    ]
                                }
                                onChange={handleCellRepetitionsChange}
                                sx={defaultTextFieldStyle}
                                inputProps={{
                                    max: 10,
                                    min: 1,
                                    step: 1,
                                }}
                            />
                        </Box>
                    );
                })}
            </Stack>
            <Divider />
            <Typography variant="subtitle1">Chemical connectivity factor</Typography>
            <Box>
                <TextField
                    label="Value"
                    type="number"
                    className="inverse stepper cell-repetitions"
                    id="chemical-connectivity-factor"
                    value={viewerSettings.chemicalConnectivityFactor}
                    onChange={handleChemicalConnectivityFactorChange}
                    sx={defaultTextFieldStyle}
                    inputProps={{
                        max: 2,
                        min: 0,
                        step: 0.1,
                    }}
                />
            </Box>
        </Stack>
    );
}

export default ParametersMenu;
