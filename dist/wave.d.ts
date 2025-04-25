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
}
