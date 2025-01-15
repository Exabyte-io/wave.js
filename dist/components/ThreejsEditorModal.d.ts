export class ThreejsEditorModal extends ModalDialog {
    editor: any;
    domElement: any;
    /**
     *  shows alert with specific parameters
     *  @typedef {{ text: string, onClick: Function }} ButtonsType
     *  @typedef {{ title: string, content: string, buttons: ButtonsType }} ShowAlertInputType
     *  @param {ShowAlertInputType} params
     */
    showAlert(params: {
        title: string;
        content: string;
        buttons: {
            text: string;
            onClick: Function;
        };
    }): void;
    /**
     * submits multiple selections group
     */
    submitMultipleSelectionGroup(): void;
    /**
     * removes multiple selection group
     */
    removeMultipleSelectionGroup(): void;
    /**
     * this function shows confirm window if user forgets to submit multiple selection and tries to exit from editor
     */
    showSubmissionMultipleSelectionModal(): void;
    /**
     * checks is multiple selection submitted
     * @returns {Boolean} true - if multiple selection is submitted false - if not
     */
    isMultipleSelectionGroupSubmitted(): boolean;
    /**
     * force exit from the modal with initially defined materials
     */
    forceExitFromEditor(): void;
    /**
     * exit form editor and calls callback
     * @param {Function} callback - function that should be called before exit from editor
     * @returns {Function} - callback that can be applied to event listener
     */
    exitWithCallback(callback: Function): Function;
    /**
     * extracts materials and hides editor
     */
    extractMaterialAndHide(): void;
    /**
     * displays error confirm window if we have some errors
     */
    onExtractMaterialError(): void;
    initialize(el: any): void;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
    /**
     * `Number.prototype.format` is used inside three.js editor codebase to format the numbers.
     * The editor does not start without it. The ESLint line is a way to turn off the warning shown in the console.
     */
    setNumberFormat(): void;
    initializeCamera: () => any;
    initializeLights(): void;
    initializeControlsInEditor(): void;
    initializeRaycaster(): void;
    raycaster: any;
    mouse: any;
    /**
     * Initialize threejs editor and add it to the DOM.
     */
    initializeEditor(): void;
    viewport: any;
    /**
     * Add dragover listeners to group the objects.
     */
    addEventListeners(): void;
    /**
     * Handle signals from the editor
     */
    addSignalsListeners(): void;
    /**
     * Load the scene based on the given materials.
     */
    loadScene(): void;
    /**
     * function to be called on Escape click or on exit from editor
     */
    onHide(): void;
    renderBody(): import("react/jsx-runtime").JSX.Element;
    alertRef: any;
}
export namespace ThreejsEditorModal {
    namespace propTypes {
        let materials: PropTypes.Validator<any[]>;
    }
}
import { ModalDialog } from "./ModalDialog";
import PropTypes from "prop-types";
