"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _periodicTable = require("@exabyte-io/periodic-table.js");
var THREE = _interopRequireWildcard(require("three"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var _default = exports.default = {
  // atoms
  // atoms.user-controllable
  atomRadiiScale: 0.2,
  repetitions: 1,
  chemicalConnectivityFactor: 1.05,
  // atoms.non-user-controllable
  defaultElement: "Si",
  sphereRadius: 1.5,
  sphereQuality: 16,
  elementColors: _periodicTable.ELEMENT_COLORS,
  vdwRadii: _periodicTable.ELEMENT_VDW_RADII,
  // line
  lineWidth: 2,
  lineMaterial: {
    dashSize: 1,
    gapSize: 2,
    scale: 2,
    linewidth: 2
  },
  colors: {
    amber: 0xffc107,
    gray: 0x808080
  },
  // general
  backgroundColor: "#202020",
  defaultColor: "#CCCCCC",
  initialCameraPosition: [-50, 0, 10],
  areLabelsInitiallyShown: false,
  isViewAdjustable: true,
  labelsConfig: {
    areSpritesUsed: true,
    fontFace: "Arial",
    fontSize: 96,
    fontWeight: "Bold",
    fillStyle: "#EEEEEE",
    strokeStyle: "#454545",
    lineWidth: 2,
    textAlign: "center",
    textBaseline: "middle"
  },
  labelPointsConfig: {
    size: 1.5,
    depthTest: true,
    depthFunc: THREE.NotEqualDepth,
    transparent: true
  },
  labelSpriteConfig: {
    transparent: true,
    depthFunc: THREE.LessEqualDepth,
    depthTest: true
  },
  boundaryConditionTypeColors: {
    bc1: [0xffff00, 0xffff00],
    bc2: [0x0000ff, 0x0000ff],
    bc3: [0xffff00, 0x0000ff]
  },
  hotKeysConfig: {
    toggleOrbitControls: "o",
    toggleInteractive: "i",
    toggleBonds: "b",
    toggleConventionalCell: "c",
    toggleLabels: "l",
    resetViewer: "r",
    toggleThreejsEditorModal: "e",
    toggleDistanceShown: "d",
    toggleAnglesShown: "a",
    deleteConnection: "x"
  }
};