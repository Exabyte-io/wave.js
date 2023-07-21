import Stack from "@mui/material/Stack";
import React from "react";

import InputWithLabel, { InputWithLabelProps } from "./InputWithLabel";

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

    const parametersFirstRow: InputWithLabelProps[] = [
        {
            label: "Radius",
            id: "sphere-radius",
            value: viewerSettings.atomRadiiScale,
            max: 10,
            min: 0.1,
            step: 0.1,
            onChange: handleSphereRadiusChange,
            className: "inverse stepper sphere-radius",
        },
        {
            label: "A",
            id: "repetitionsAlongLatticeVectorA",
            value: viewerSettings.repetitionsAlongLatticeVectorA,
            max: 10,
            min: 1,
            step: 1,
            onChange: handleCellRepetitionsChange,
            className: "inverse stepper cell-repetitions",
        },
        {
            label: "B",
            id: "repetitionsAlongLatticeVectorB",
            value: viewerSettings.repetitionsAlongLatticeVectorB,
            max: 10,
            min: 1,
            step: 1,
            onChange: handleCellRepetitionsChange,
            className: "inverse stepper cell-repetitions",
        },
        {
            label: "C",
            id: "repetitionsAlongLatticeVectorC",
            value: viewerSettings.repetitionsAlongLatticeVectorC,
            max: 10,
            min: 1,
            step: 1,
            onChange: handleCellRepetitionsChange,
            className: "inverse stepper cell-repetitions",
        },
    ];

    const parametersSecondRow: InputWithLabelProps = {
        label: "Chemical Connectivity Factor",
        id: "chemical-connectivity-factor",
        value: viewerSettings.chemicalConnectivityFactor,
        max: 2,
        min: 0,
        step: 0.1,
        onChange: handleChemicalConnectivityFactorChange,
        className: "inverse stepper cell-repetitions",
    };

    return (
        <Stack>
            <Stack key="parameters-first-row" direction="row">
                {parametersFirstRow.map((props) => {
                    const { id } = props;
                    return (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <InputWithLabel key={id} {...props} />
                    );
                })}
            </Stack>
            {parametersSecondRow && (
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                <InputWithLabel key={parametersSecondRow.id} {...parametersSecondRow} />
            )}
        </Stack>
    );
}

export default ParametersMenu;
