"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIN_ANGLE_POINTS_DISTANCE = exports.MEASUREMENT_LABELS_GROUP_NAME = exports.LABELS_GROUP_NAME = exports.COLORS = exports.BOUNDARY_CONDITIONS = exports.ATOM_GROUP_NAME = exports.ATOM_CONNECTION_LINE_NAME = exports.ATOM_CONNECTIONS_GROUP_NAME = exports.ANGLE = void 0;
const BOUNDARY_CONDITIONS = exports.BOUNDARY_CONDITIONS = [{
  type: "pbc",
  name: "Periodic Boundary Condition (pbc)",
  isNonPeriodic: false
}, {
  type: "bc1",
  name: "Vacuum-Slab-Vacuum (bc1)",
  isNonPeriodic: true
}, {
  type: "bc2",
  name: "Metal-Slab-Metal (bc2)",
  isNonPeriodic: true
}, {
  type: "bc3",
  name: "Vacuum-Slab-Metal (bc3)",
  isNonPeriodic: true
}];
const ATOM_GROUP_NAME = exports.ATOM_GROUP_NAME = "Atoms";
const ATOM_CONNECTIONS_GROUP_NAME = exports.ATOM_CONNECTIONS_GROUP_NAME = "Atom_Connections";
const ATOM_CONNECTION_LINE_NAME = exports.ATOM_CONNECTION_LINE_NAME = "Atom_Connection";
const MIN_ANGLE_POINTS_DISTANCE = exports.MIN_ANGLE_POINTS_DISTANCE = 0.7;
const MEASUREMENT_LABELS_GROUP_NAME = exports.MEASUREMENT_LABELS_GROUP_NAME = "Measure_Labels";
const ANGLE = exports.ANGLE = "ANGLE";
const LABELS_GROUP_NAME = exports.LABELS_GROUP_NAME = "Labels_Group";
const COLORS = exports.COLORS = {
  RED: 0xff0000,
  GREEN: 0x00ff00
};