/**
 * Wrapper component containing 3D visualization through `WaveComponent` and the associated controls
 */
export class ThreeDEditor extends React.Component<any, any, any> {
    /**
     * Create a ThreeDEditor component
     * @param props Properties as explained below
     */
    constructor(props: any);
    state: {
        isInteractive: boolean;
        activeToolbarMenu: null;
        isEditModeActive: boolean;
        activeTransformMode: string;
        historyStack: any[];
        historyPointer: number;
        selectedAtomIndices: never[];
        coordinateDrafts: null[];
        elementDraft: null;
        measurementsSettings: {
            isActive: boolean;
            measurementType: string;
            values: never[];
        }[];
        viewerTriggerResize: boolean;
        viewerSettings: {
            isViewAdjustable: any;
            atomRadiiScale: any;
            repetitionsAlongLatticeVectorA: any;
            repetitionsAlongLatticeVectorB: any;
            repetitionsAlongLatticeVectorC: any;
            chemicalConnectivityFactor: any;
        };
        _initialToggleSettings: {
            orthographicCamera: any;
            bonds: any;
            axes: any;
            autoRotate: any;
            elementLabels: any;
            coordinateLabels: any;
        };
        boundaryConditions: any;
        isConventionalCellShown: any;
        originalMaterial: any;
        material: any;
    };
    handleCellRepetitionsChange(e: any): void;
    handleSphereRadiusChange(e: any): void;
    handleDownloadClick(format?: string): void;
    handleToggleInteractive(): void;
    handleToggleToolbarMenu(toolbarMenuName: any): void;
    handleToggleBonds(): void;
    handleToggleEditMode(): void;
    handleToggleOrthographicCamera(): void;
    handleToggleElementLabels(): void;
    handleToggleCoordinateLabels(): void;
    handleToggleConventionalCell(): void;
    handleToggleIsViewAdjustable(): void;
    handleResetViewer(): void;
    handleTakeScreenshot(): void;
    handleToggleOrbitControls(): void;
    handleToggleOrbitControlsAnimation(): void;
    handleToggleAxes(): void;
    handleStructureModified(newMaterial: any, source: any): void;
    handleUndo(): void;
    handleRedo(): void;
    /**
     * Commits a single axis of the selected atom's coordinate. Only called once per field edit
     * (on blur/Enter, via handleCoordinateCommit below) rather than per keystroke, so this is
     * naturally one history entry per edit (D18). Mutates a clone's basis in place via
     * Basis/setBasis rather than reconstructing via fromElementsAndCoordinates, so labels and
     * constraints on every atom (including the one being edited) survive untouched (D7). Only
     * meaningful for exactly one selected atom - the coordinate panel itself is hidden for 0 or
     * 2+ selected (see renderEditToolbar), so this is a defensive guard, not the primary gate.
     */
    handleCoordinateChange(axisIndex: any, value: any): void;
    /**
     * Updates only the local draft string for one coordinate field while it's focused - no
     * commit, no history entry, no scene rebuild. Lets the field be cleared or start with "-"
     * without the browser's number-input semantics dropping the keystroke (D18).
     */
    handleCoordinateDraftChange(axisIndex: any, value: any): void;
    /**
     * Commits the draft for one coordinate field (on blur/Enter) if it parses to a real number,
     * then clears the draft so the field reverts to showing the committed value.
     */
    handleCoordinateCommit(axisIndex: any): void;
    handleSetTransformMode(mode: any): void;
    /**
     * Places a new atom at the true center of the cell - (a+b+c)/2, the vector sum of the three
     * lattice vectors halved - not the component-wise (ax/2, by/2, cz/2), which lands off-center
     * or outside the cell entirely for non-orthogonal lattices (D22). If that position is
     * already occupied (e.g. a second click with nothing else changed), nudges the candidate
     * along the diagonal until it clears every existing atom by OCCUPIED_TOLERANCE, so repeated
     * clicks don't silently stack coincident duplicates.
     */
    handleAddAtom(): void;
    handleRemoveSelectedAtom(): void;
    handleCloneSelectedAtoms(): void;
    handleFocusCameraOnSelection(): void;
    /**
     * Updates only the local draft string for the element field while it's focused - no commit,
     * no history entry, no scene rebuild. Mirrors handleCoordinateDraftChange (D18).
     */
    handleElementDraftChange(value: any): void;
    /**
     * Commits the element draft (on blur/Enter) if it names a real element that differs from the
     * current one, then clears the draft so the field reverts to showing the committed value.
     * Operates directly on state.material like handleCoordinateChange, rather than through the
     * mixin - this is a panel-typed edit, not a scene-gesture-driven one. Symbol casing is
     * normalized (e.g. "si"/"SI" -> "Si") so the field isn't case-sensitive to use, then checked
     * against PERIODIC_TABLE so a typo silently reverts instead of writing a bogus element.
     */
    handleElementCommit(): void;
    /**
     * Selection changes are a visual-only, wave-internal concern (highlight + gizmo, already
     * handled inside the mixin) - the only reason React needs to know the indices at all is to
     * drive the coordinate panel/toolbar. Without the bypass guard, this setState triggers a
     * WaveComponent re-render with a freshly cloned structure prop, which componentDidUpdate
     * sees as "changed" and reloads/rebuilds the entire scene on every single click or hover-driven
     * selection - orphaning an in-progress drag's mesh reference (D3) and making selection
     * sluggish on larger structures (R17).
     *
     * indices is an array of atomicIndex (D-4: multi-select) - empty for none, one entry for a
     * single atom, 2+ for a group selection.
     */
    handleSelectionChanged(indices: any): void;
    /**
     * Delete/Backspace/Ctrl(Cmd)+Z/Ctrl(Cmd)+Shift+Z don't fire the "keypress" event the rest of
     * this component's hotkeys rely on (keypress only fires for character-producing keys), so
     * they're handled separately here on "keydown". Guarded the same way as handleKeyPress:
     * only while interactive and not while a form field has focus.
     */
    handleEditModeKeyDown(event: any): void;
    /**
     * Public, ref-accessible undo-availability check (part of the host embedding API - a host
     * can drive undo/redo via a ref to this component instead of only through this toolbar).
     */
    canUndo(): boolean;
    canRedo(): boolean;
    /**
     * Spec §6.3's documented ref API names these undo()/redo() (canUndo/canRedo already matched);
     * thin aliases so `ref.current.undo()` works as documented instead of only the internal
     * handleUndo/handleRedo names.
     */
    undo(): void;
    redo(): void;
    renderEditToolbar(): import("react/jsx-runtime").JSX.Element;
    handleChemicalConnectivityFactorChange(e: any): void;
    handleToggleMeasurement(measurementMode: any): void;
    handleSetState(newState: any): void;
    handleSetMeasurementSettingsForTypeInState(newMeasurementSettingsForType: any): void;
    handleDeleteConnection(): void;
    handleResetMeasurements(): void;
    addHotKeyListener(): void;
    removeHotKeyListener(): void;
    handleStartGifRecording(downloadPath: any, rotationSpeed?: number, frameDuration?: number): Promise<void>;
    handleSetMaterial(newMaterialConfig: any): void;
    componentDidMount(): void;
    /**
     * Apply toggle-based view settings from URL params after the Wave instance is mounted.
     * These settings are imperative (they toggle state on the Wave class instance),
     * so they must be applied after componentDidMount when WaveComponent.wave exists.
     */
    _applyInitialToggleSettings(): void;
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    _resetStateWaveComponent(): void;
    handleSetSetting: (setting: any) => void;
    getKeyConfig(): {
        [x: string]: () => void;
    };
    handleKeyPress: (e: any) => void;
    getPrimitiveOrConventionalMaterial(material: any, isConventionalCellShown?: boolean): any;
    /**
     * Pushes a material to the viewer via the official setStructure()/rebuildScene() path and
     * notifies the parent. Used as the setState callback for every history-affecting change
     * (edit, undo, redo) once bypassReloadViewer has already been set so WaveComponent's own
     * prop-driven reload doesn't race with it. `source` is spec Sec6.2's onEditCommit contract
     * (`drag`/`gizmo`/`coordinate-input`/`element-input`/`add`/`remove`/`clone`/`undo`/`redo`) -
     * forwarded alongside the back-compat `onUpdate` channel so a host can record history without
     * double-counting instead of having to re-infer what kind of edit just happened.
     */
    _applyMaterialToViewer(material: any, source: any): void;
    _getWaveProperty(name: any): any;
    /**
     * Returns a cover div to cover the area and prevent user interaction with component
     */
    renderCoverDiv(): import("react/jsx-runtime").JSX.Element;
    renderWaveComponent(): import("react/jsx-runtime").JSX.Element;
    WaveComponent: WaveComponent | null | undefined;
    getCheckmark(isActive: any): import("react/jsx-runtime").JSX.Element;
    getViewSettingsActions: () => ({
        id: string;
        disabled: boolean;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        rightIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        isDivider?: undefined;
    } | {
        id: string;
        isDivider: boolean;
        disabled?: undefined;
        content?: undefined;
        leftIcon?: undefined;
        rightIcon?: undefined;
        onClick?: undefined;
        shouldMenuStayOpened?: undefined;
    } | {
        id: string;
        disabled: boolean;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        rightIcon?: undefined;
        isDivider?: undefined;
    })[];
    getMeasurementsActions: () => ({
        id: string;
        content: string;
        rightIcon: import("react/jsx-runtime").JSX.Element;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        isDivider?: undefined;
    } | {
        id: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        shouldMenuStayOpened: boolean;
        rightIcon?: undefined;
        isDivider?: undefined;
    } | {
        id: string;
        isDivider: boolean;
        content?: undefined;
        rightIcon?: undefined;
        leftIcon?: undefined;
        onClick?: undefined;
        shouldMenuStayOpened?: undefined;
    })[];
    getExportActions: () => ({
        id: string;
        title: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        actions?: undefined;
        paperPlacement?: undefined;
    } | {
        id: string;
        title: string;
        content: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: {
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
        }[];
        paperPlacement: string;
        onClick?: undefined;
    })[];
    getParametersActions: () => import("react/jsx-runtime").JSX.Element;
    getToolbarConfig(): ({
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        contentObject: import("react/jsx-runtime").JSX.Element;
        onClick: () => void;
        actions?: undefined;
    } | {
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: ({
            id: string;
            content: string;
            rightIcon: import("react/jsx-runtime").JSX.Element;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            shouldMenuStayOpened: boolean;
            isDivider?: undefined;
        } | {
            id: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            shouldMenuStayOpened: boolean;
            rightIcon?: undefined;
            isDivider?: undefined;
        } | {
            id: string;
            isDivider: boolean;
            content?: undefined;
            rightIcon?: undefined;
            leftIcon?: undefined;
            onClick?: undefined;
            shouldMenuStayOpened?: undefined;
        })[];
        onClick: () => void;
        contentObject?: undefined;
    } | {
        id: string;
        title: string;
        header: string;
        leftIcon: import("react/jsx-runtime").JSX.Element;
        actions: ({
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            onClick: () => void;
            actions?: undefined;
            paperPlacement?: undefined;
        } | {
            id: string;
            title: string;
            content: string;
            leftIcon: import("react/jsx-runtime").JSX.Element;
            actions: {
                id: string;
                title: string;
                content: string;
                leftIcon: import("react/jsx-runtime").JSX.Element;
                onClick: () => void;
            }[];
            paperPlacement: string;
            onClick?: undefined;
        })[];
        onClick: () => void;
        contentObject?: undefined;
    })[];
    renderWaveOrThreejsEditorModal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ThreeDEditor {
    namespace propTypes {
        let material: PropTypes.Validator<import("@mat3ra/made").Material>;
        let editable: PropTypes.Requireable<boolean>;
        let isConventionalCellShown: PropTypes.Requireable<boolean>;
        let boundaryConditions: PropTypes.Requireable<object>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let onEditCommit: PropTypes.Requireable<(...args: any[]) => any>;
        let onEditModeChanged: PropTypes.Requireable<(...args: any[]) => any>;
        let onSelectionChanged: PropTypes.Requireable<(...args: any[]) => any>;
        let isStandalone: PropTypes.Requireable<boolean>;
        let initialViewSettings: PropTypes.Requireable<object>;
        let editSessionOptions: PropTypes.Requireable<object>;
    }
    namespace defaultProps {
        let boundaryConditions_1: {};
        export { boundaryConditions_1 as boundaryConditions };
        let isConventionalCellShown_1: boolean;
        export { isConventionalCellShown_1 as isConventionalCellShown };
        let onUpdate_1: undefined;
        export { onUpdate_1 as onUpdate };
        let onEditCommit_1: undefined;
        export { onEditCommit_1 as onEditCommit };
        let onEditModeChanged_1: undefined;
        export { onEditModeChanged_1 as onEditModeChanged };
        let onSelectionChanged_1: undefined;
        export { onSelectionChanged_1 as onSelectionChanged };
        let editable_1: boolean;
        export { editable_1 as editable };
        let isStandalone_1: boolean;
        export { isStandalone_1 as isStandalone };
        let initialViewSettings_1: {};
        export { initialViewSettings_1 as initialViewSettings };
        let editSessionOptions_1: {};
        export { editSessionOptions_1 as editSessionOptions };
    }
}
import React from "react";
import { WaveComponent } from "./WaveComponent";
import PropTypes from "prop-types";
