/**
 * Wave draws atoms as spheres according to the material geometry passed.
 */
export class Wave {
    /**
     *
     * @param {Object} config
     */
    constructor(config: Object);
    rebuildScene(): void;
    render(): void;
    doFunc(func: any): void;
    clearView(): void;
    adjustCamerasAndOrbitControlsToCell(): void;
    collectAllAtoms(): any[];
    /**
     * Function that called when scene is rebuilding.
     * When scene is rebuilding and all atoms lost color this function is fills current selected atoms by color.
     */
    refillSelectedAtoms(): void;
    selectedAtoms: any[] | undefined;
}
