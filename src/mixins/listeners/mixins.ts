import { listenerImplementation, raycasterImplementation } from "./implementations";
import { IListenerCapable, IRaycasterCapable } from "./types";

type Constructor<T = {}> = new (...args: any[]) => T;

export const ListenersMixin = <T extends Constructor>(superclass: T) =>
    class extends superclass implements IListenerCapable {
        canvas: HTMLCanvasElement;

        onClick: (event: MouseEvent) => void;

        onPointerMove: (event: MouseEvent) => void;

        destroyListeners() {
            listenerImplementation.destroyListeners(this);
        }

        initListeners(updateState?: any, settings?: any) {
            this.onClick = (event) => {
                const activeMeasurementManager = this.getActiveMeasurementManager?.();
                if (activeMeasurementManager) {
                    activeMeasurementManager.onClick(event);
                    this.render();
                }
            };

            this.onPointerMove = (event) => {
                const activeMeasurementManager = this.getActiveMeasurementManager?.();
                if (activeMeasurementManager) {
                    activeMeasurementManager.onPointerMove(event);
                    this.render();
                }
            };

            listenerImplementation.initListeners(this);
        }
    };

export const RaycasterMixin = <T extends Constructor>(superclass: T) =>
    class extends superclass implements IRaycasterCapable {
        raycaster: THREE.Raycaster;

        pointer: THREE.Vector2;

        camera: THREE.Camera;

        initRaycaster() {
            raycasterImplementation.initRaycaster(this);
        }

        checkMouseCoordinates(event: MouseEvent) {
            raycasterImplementation.checkMouseCoordinates(this, event);
        }

        getAtomGroup(): THREE.Object3D[] {
            return raycasterImplementation.getAtomGroup(this);
        }
    };
