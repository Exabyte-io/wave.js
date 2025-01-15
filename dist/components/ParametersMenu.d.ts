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
declare function ParametersMenu(props: ParametersMenuProps): import("react/jsx-runtime").JSX.Element;
export default ParametersMenu;
