import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";

export type ViewerSettings = {
    isViewAdjustable: boolean;
    atomRadiiScale: number;
    repetitionsAlongLatticeVectorA: number;
    repetitionsAlongLatticeVectorB: number;
    repetitionsAlongLatticeVectorC: number;
    chemicalConnectivityFactor: number;
};

type ViewerSettingsKey = keyof ViewerSettings;

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

    return (
        <Stack spacing={1.5} margin={2}>
            <Typography variant="body1">Atomic radius</Typography>
            <Box>
                <TextField
                    fullWidth
                    label="Value"
                    type="number"
                    size="small"
                    className="inverse stepper sphere-radius"
                    id="sphere-radius"
                    value={viewerSettings.atomRadiiScale}
                    onChange={handleSphereRadiusChange}
                    inputProps={{
                        max: 10,
                        min: 0.1,
                        step: 0.1,
                    }}
                />
            </Box>
            <Typography variant="body1">Repetition along vectors:</Typography>
            <Stack key="repetition" direction="row" spacing={1}>
                {["A", "B", "C"].map((label) => {
                    const key = `repetitionsAlongLatticeVector${label}` as ViewerSettingsKey;

                    return (
                        <Box key={label}>
                            <TextField
                                label={label}
                                size="small"
                                type="number"
                                className="inverse stepper cell-repetitions"
                                id={`repetitionsAlongLatticeVector${label}`}
                                value={viewerSettings[key]}
                                onChange={handleCellRepetitionsChange}
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
            <Typography variant="body1">Chemical connectivity factor</Typography>
            <Box>
                <TextField
                    fullWidth
                    size="small"
                    label="Value"
                    type="number"
                    className="inverse stepper cell-repetitions"
                    id="chemical-connectivity-factor"
                    value={viewerSettings.chemicalConnectivityFactor}
                    onChange={handleChemicalConnectivityFactorChange}
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
