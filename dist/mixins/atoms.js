"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomsMixin = void 0;
var THREE = _interopRequireWildcard(require("three"));
var _enums = require("../enums");
var _utils = require("./utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/*
 * Mixin containing the logic for dealing with atoms.
 * Draws atoms as spheres and handles actions performed on them.
 */
const AtomsMixin = superclass => class extends superclass {
  constructor(config) {
    super(config);

    // to draw atoms as spheres
    this.initSphereParameters();
    this.drawAtomsAsSpheres = this.drawAtomsAsSpheres.bind(this);
    this.getAtomColorByElement = this.getAtomColorByElement.bind(this);
    this.setStructure(this._structure);
  }
  get structure() {
    return this._structure;
  }

  /**
   * Helper function to set the structural information.
   * @param {Made.Material} s - Structural information as Made.Material.
   */
  setStructure(s) {
    this._structure = s.clone(); // clone original structure to assert that any updates are propagated to parents
    this._basis = s.Basis;
    this._basis.originalUnits = this._basis.units;
    this._basis.toCartesian();
  }
  get basis() {
    return this._basis;
  }
  initSphereParameters() {
    // radius, segment, ring
    const sphereGeometry = new THREE.SphereGeometry(1, this.settings.sphereQuality, this.settings.sphereQuality);
    const sphereMaterial = new THREE.MeshLambertMaterial();
    this.sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  }

  /**
   * Prepares a sphere mesh object
   * @param {String} color
   * @param {Number} radius
   * @param {Array} coordinate
   * @return {THREE.Object3D}
   */
  getSphereMeshObject({
    color = this.settings.defaultColor,
    radius = this.settings.sphereRadius,
    coordinate = []
  }) {
    // clone original mesh to optimize the speed
    const sphereMesh = this.sphereMesh.clone();
    // set material color after cloning to optimize the speed and avoid re-creating material object
    sphereMesh.material = sphereMesh.material.clone();
    sphereMesh.material.setValues({
      color
    });

    // eslint-disable-next-line no-multi-assign
    sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = radius;
    sphereMesh.position.set(...coordinate);
    return sphereMesh;
  }
  _getDefaultSettingsForElement(element = this.settings.defaultElement, scale = this.settings.atomRadiiScale) {
    return {
      color: this.getAtomColorByElement(element),
      radius: this.getAtomRadiusByElement(element, scale)
    };
  }
  createAtomsGroup(basis, atomRadiiScale) {
    const atomsGroup = new THREE.Group();
    atomsGroup.name = _enums.ATOM_GROUP_NAME;
    const {
      atomicLabelsArray,
      elementsWithLabelsArray
    } = basis;
    basis.coordinates.forEach((atomicCoordinate, atomicIndex) => {
      const element = basis.getElementByIndex(atomicIndex);
      const sphereMesh = this.getSphereMeshObject({
        ...this._getDefaultSettingsForElement(element, atomRadiiScale),
        coordinate: atomicCoordinate.value
      });
      sphereMesh.name = `${element}-${atomicIndex}`;
      // store any additional data in userData
      // https://threejs.org/docs/#api/en/core/Object3D.userData
      sphereMesh.userData = {
        ...sphereMesh.userData,
        symbolWithLabel: elementsWithLabelsArray[atomicIndex]
      };
      const atomColor = this.getAtomColorByElement(element).toLowerCase();
      const label = parseInt(atomicLabelsArray[atomicIndex], 10) || 0;
      // set glow according to the label value as offset, currently
      // only single digit numeric labels are allowed, in practice we
      // expect only two different labels: 1 and 2 for up and down
      // spin representations
      (0, _utils.ApplyGlow)(sphereMesh, atomColor, label);
      atomsGroup.add(sphereMesh);
    });
    return atomsGroup;
  }
  drawAtomsAsSpheres(atomRadiiScale) {
    const basis = this.areNonPeriodicBoundariesPresent ? this.basisWithElementsInsideNonPeriodicBoundaries : this.basis;
    this.repeatAtomsAtRepetitionCoordinates(this.createAtomsGroup(basis, atomRadiiScale));
  }
  getAtomColorByElement(element, pallette = this.settings.elementColors) {
    return pallette[element] || this.settings.defaultColor;
  }
  getAtomRadiusByElement(element, scale = 1.0, radiimap = this.settings.vdwRadii) {
    return (radiimap[element] || this.settings.sphereRadius) * scale;
  }
};
exports.AtomsMixin = AtomsMixin;