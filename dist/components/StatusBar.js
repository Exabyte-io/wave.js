import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import settings from "../settings";
export function normalizeElement(entry) {
    if (!entry)
        return "";
    if (typeof entry === "string")
        return entry;
    return entry.value || entry.element || "";
}
/** Element symbols in first-appearance order with their counts - the composition legend. */
export function getComposition(material) {
    var _a;
    const elements = (_a = material === null || material === void 0 ? void 0 : material.basis) === null || _a === void 0 ? void 0 : _a.elements;
    if (!Array.isArray(elements))
        return [];
    const counts = new Map();
    elements.forEach((entry) => {
        const symbol = normalizeElement(entry);
        if (symbol)
            counts.set(symbol, (counts.get(symbol) || 0) + 1);
    });
    return Array.from(counts.entries());
}
const norm = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
/**
 * Lattice constants from the cell vectors rather than from a `Lattice` getter: the vectors are
 * the one representation every code path here already relies on (`Lattice.unitCell` drives
 * add-atom placement and the viewer's own cell object), so this cannot disagree with what is
 * drawn.
 */
export function getLatticeSummary(material) {
    var _a;
    const lattice = (_a = material === null || material === void 0 ? void 0 : material.getLattice) === null || _a === void 0 ? void 0 : _a.call(material);
    const cell = lattice === null || lattice === void 0 ? void 0 : lattice.unitCell;
    const type = lattice === null || lattice === void 0 ? void 0 : lattice.type;
    if (!cell)
        return type || "";
    const { ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0, cx = 0, cy = 0, cz = 0 } = cell;
    const a = norm(ax, ay, az);
    const b = norm(bx, by, bz);
    const c = norm(cx, cy, cz);
    if (!a && !b && !c)
        return type || "";
    const round = (value) => value.toFixed(3);
    // Collapse a = b = c to a single figure; showing "5.431 · 5.431 · 5.431" is noise.
    const isCubicLength = Math.abs(a - b) < 1e-4 && Math.abs(b - c) < 1e-4;
    const lengths = isCubicLength
        ? `a = ${round(a)} Å`
        : `a, b, c = ${round(a)}, ${round(b)}, ${round(c)} Å`;
    return [type, lengths].filter(Boolean).join(" · ");
}
/** Splits "Si8O16" into symbol/count pairs so the counts can render as subscripts. */
export function tokenizeFormula(formula) {
    const tokens = [];
    const pattern = /([A-Z][a-z]?)(\d*)/g;
    let match = pattern.exec(formula);
    while (match) {
        if (match[1])
            tokens.push([match[1], match[2] || ""]);
        match = pattern.exec(formula);
    }
    return tokens;
}
/**
 * `elementColors` values are CSS strings in the periodic-table package but numeric hex in
 * some overrides, so accept both rather than trusting one.
 */
function toCssColor(value) {
    if (typeof value === "number")
        return `#${value.toString(16).padStart(6, "0")}`;
    if (typeof value === "string")
        return value.startsWith("#") ? value : `#${value}`;
    return settings.defaultColor;
}
function FormulaText({ formula }) {
    const tokens = tokenizeFormula(formula);
    // A formula the tokenizer cannot read (an empty string, or a name that is not a formula at
    // all) still renders verbatim rather than vanishing.
    const parts = tokens.length ? tokens : [[formula, ""]];
    return (_jsx(_Fragment, { children: parts.map(([symbol, count], index) => (
        // Position *is* the identity here - a formula like "SiOSi" repeats symbols, so
        // there is no stabler key than where the token sits.
        // eslint-disable-next-line react/no-array-index-key
        _jsxs(React.Fragment, { children: [symbol, count && (_jsx(Box, { component: "sub", sx: { fontSize: "0.72em", lineHeight: 0 }, children: count }))] }, `${symbol}${count}-${index}`))) }));
}
function StatusBar(props) {
    var _a, _b, _c;
    const { material, selectedAtomIndices = [], selectedElement = "", measurement = null, lastActionHint = null, onSelectElement, } = props;
    const theme = useTheme();
    const composition = useMemo(() => getComposition(material), [material]);
    const latticeSummary = useMemo(() => getLatticeSummary(material), [material]);
    const atomCount = ((_b = (_a = material === null || material === void 0 ? void 0 : material.basis) === null || _a === void 0 ? void 0 : _a.elements) === null || _b === void 0 ? void 0 : _b.length) || 0;
    const formula = (material === null || material === void 0 ? void 0 : material.formula) || (material === null || material === void 0 ? void 0 : material.unitCellFormula) || "";
    const units = ((_c = material === null || material === void 0 ? void 0 : material.basis) === null || _c === void 0 ? void 0 : _c.units) === "cartesian" ? "cartesian, Å" : "crystal";
    let selectionText = "";
    if (selectedAtomIndices.length === 1) {
        const [index] = selectedAtomIndices;
        selectionText = `${selectedElement || "atom"} #${index} selected`;
    }
    else if (selectedAtomIndices.length > 1) {
        selectionText = `${selectedAtomIndices.length} atoms selected`;
    }
    const facts = [
        atomCount ? `${atomCount} atom${atomCount === 1 ? "" : "s"}` : "",
        latticeSummary,
        units,
    ].filter(Boolean);
    return (_jsxs(Stack, { "data-name": "StatusBar", direction: "row", alignItems: "center", spacing: 2, sx: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: "34px",
            px: 1.5,
            py: 0.5,
            backgroundColor: "rgba(24, 24, 24, 0.92)",
            borderTop: `1px solid ${theme.palette.divider}`,
            // The canvas owns pointer events; only the chips opt back in.
            pointerEvents: "none",
            overflowX: "auto",
            whiteSpace: "nowrap",
        }, children: [formula && (_jsx(Typography, { variant: "caption", fontWeight: "bold", "data-name": "StatusBarFormula", children: _jsx(FormulaText, { formula: formula }) })), Boolean(facts.length) && (_jsx(Typography, { variant: "caption", color: "text.secondary", children: facts.join(" · ") })), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { pointerEvents: "auto" }, children: composition.map(([symbol, count]) => {
                    var _a;
                    const swatch = toCssColor((_a = settings.elementColors) === null || _a === void 0 ? void 0 : _a[symbol]);
                    const chip = (_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.5, "data-name": `StatusBarChip-${symbol}`, onClick: onSelectElement ? () => onSelectElement(symbol) : undefined, sx: {
                            px: 0.75,
                            py: 0.125,
                            borderRadius: "11px",
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: onSelectElement ? "pointer" : "default",
                            "&:hover": onSelectElement
                                ? { borderColor: theme.palette.primary.main }
                                : undefined,
                        }, children: [_jsx(Box, { sx: {
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    backgroundColor: swatch,
                                    flexShrink: 0,
                                } }), _jsx(Typography, { variant: "caption", children: `${symbol} ${count}` })] }, symbol));
                    return onSelectElement ? (_jsx(Tooltip, { title: `Select all ${count} ${symbol} atoms`, children: chip }, symbol)) : (chip);
                }) }), _jsxs(Stack, { direction: "row", spacing: 1.5, sx: { marginLeft: "auto !important" }, "aria-live": "polite", "aria-atomic": "true", "data-name": "StatusBarLive", children: [lastActionHint && (_jsx(Typography, { variant: "caption", color: "primary.main", "data-name": "StatusBarHint", children: lastActionHint })), selectionText && _jsx(Typography, { variant: "caption", children: selectionText }), measurement && (_jsx(Typography, { variant: "caption", color: "warning.main", children: measurement }))] })] }));
}
export default StatusBar;
