import { getArrayFromVector } from "./threeJsUtils";
export class VerticesHashMapHandler {
    constructor() {
        this.hashmap = {};
    }
    add(key, value) {
        if (!this.hashmap[key]) {
            this.hashmap[key] = [...value];
        }
        else {
            this.hashmap[key].push(...value);
        }
    }
    get(key) {
        return this.hashmap[key];
    }
    iterateCoordinates(callback) {
        Object.entries(this.hashmap).forEach(([key, vertices]) => {
            for (let i = 0; i < vertices.length; i += 3) {
                const coordinateAsArray = vertices.slice(i, i + 3);
                callback(key, coordinateAsArray);
            }
        });
    }
}
export function createObjectVerticesHashMap(getVerticeKeyPerObject = (object) => object.name, objectsToUse = []) {
    const positionsHashMap = new VerticesHashMapHandler();
    const getVerticeKeyPerObjectFn = getVerticeKeyPerObject;
    if (objectsToUse)
        objectsToUse.forEach((object) => {
            const [x, y, z] = getArrayFromVector(object.position);
            const mapKey = getVerticeKeyPerObjectFn(object);
            positionsHashMap.add(mapKey, [x, y, z]);
        });
    return positionsHashMap;
}
