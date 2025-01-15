"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RepetitionMixin = void 0;
var _made = require("@mat3ra/made");
var THREE = _interopRequireWildcard(require("three"));
var _enums = require("../enums");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const RepetitionMixin = superclass => class extends superclass {
  /**
   * Returns an array of coordinates (lattice points) to repeat the 3D objects bases on the number of repetitions.
   * The method should get the maximum number of repetitions in one of the vectors (numberOfRepetitions)
   */
  repetitionCoordinates(numberOfRepetitions) {
    const basis = new _made.Made.Basis({
      ...this.basis.toJSON(),
      elements: ["Si"],
      coordinates: [[0, 0, 0]]
    });
    // avoid repeating in z direction if boundaries are enabled.
    const repetitions = [numberOfRepetitions, numberOfRepetitions, this.areNonPeriodicBoundariesPresent ? 1 : numberOfRepetitions];
    return _made.Made.tools.basis.repeat(basis, repetitions).coordinates.map(c => c.value);
  }

  /**
   * The method receives coordinates in the form of a cube (NxNxN) and repetitions we want to display
   * Returns a new array based on the received data
   */
  // eslint-disable-next-line class-methods-use-this
  coordinatesByAxes(coordinates, repetitions) {
    const {
      repetitionsAlongLatticeVectorA,
      repetitionsAlongLatticeVectorB,
      repetitionsAlongLatticeVectorC
    } = repetitions;
    const maxNumberOfRepetitions = Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC);
    if (!repetitionsAlongLatticeVectorA && !repetitionsAlongLatticeVectorB && !repetitionsAlongLatticeVectorC) return coordinates;
    let columns = coordinates.reduce((res, item, index) => {
      if (index % maxNumberOfRepetitions === 0) {
        res[res.length] = [item];
      } else {
        res[res.length - 1].push(item);
      }
      return res;
    }, []);
    if (repetitionsAlongLatticeVectorA < maxNumberOfRepetitions) {
      columns = columns.slice(0, maxNumberOfRepetitions * repetitionsAlongLatticeVectorA);
    }
    if (repetitionsAlongLatticeVectorB < maxNumberOfRepetitions) {
      columns = columns.filter((item, index) => index % maxNumberOfRepetitions < repetitionsAlongLatticeVectorB);
    }
    if (repetitionsAlongLatticeVectorC < maxNumberOfRepetitions) {
      columns = columns.map(arr => arr.filter((item, index) => index < repetitionsAlongLatticeVectorC));
    }
    return columns.reduce((res, item) => {
      res.push(...item);
      return res;
    }, []);
  }

  /**
   * Repeats a given 3D object at the lattice points given by repetitionCoordinates function.
   */
  repeatObject3DAtRepetitionCoordinates(object3D) {
    const {
      settings: {
        repetitionsAlongLatticeVectorA,
        repetitionsAlongLatticeVectorB,
        repetitionsAlongLatticeVectorC
      }
    } = this;
    const coordinates = this.repetitionCoordinates(Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC));
    this.structureGroup.add(object3D);
    this.coordinatesByAxes(coordinates, {
      repetitionsAlongLatticeVectorA,
      repetitionsAlongLatticeVectorB,
      repetitionsAlongLatticeVectorC
    }).slice(1).forEach(point => {
      const object3DClone = object3D.clone();
      object3DClone.position.add(new THREE.Vector3(...point));
      this.structureGroup.add(object3DClone);
    });
  }

  /**
   * Repeats a given 3D atom at the lattice points given by repetitionCoordinates function.
   * This function was added because previous one function for repeating atoms is not correct for the atoms
   * with measurement functionality.
   */
  repeatAtomsAtRepetitionCoordinates(object3D) {
    const {
      settings: {
        repetitionsAlongLatticeVectorA,
        repetitionsAlongLatticeVectorB,
        repetitionsAlongLatticeVectorC
      }
    } = this;
    const coordinates = this.repetitionCoordinates(Math.max(repetitionsAlongLatticeVectorA, repetitionsAlongLatticeVectorB, repetitionsAlongLatticeVectorC));
    this.structureGroup.add(object3D);
    this.coordinatesByAxes(coordinates, {
      repetitionsAlongLatticeVectorA,
      repetitionsAlongLatticeVectorB,
      repetitionsAlongLatticeVectorC
    }).slice(1).forEach(point => {
      const object3DClone = new THREE.Group();
      object3DClone.name = _enums.ATOM_GROUP_NAME;
      object3D.children.forEach(child => {
        const newChild = child.clone(true);
        newChild.material = child.material.clone(true);
        object3DClone.add(newChild);
      });
      object3DClone.position.add(new THREE.Vector3(...point));
      this.structureGroup.add(object3DClone);
    });
  }
};
exports.RepetitionMixin = RepetitionMixin;