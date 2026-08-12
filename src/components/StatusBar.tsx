import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";

import settings from "../settings";

/**
 * Nothing in the viewer used to say what structure was on screen: no formula, no atom count,
 * no lattice, and no units except one caption inside the edit panel that only appeared while
 * exactly one atom was selected (finding F10). Measurement results were equally invisible -
 * a 3D sprite plus a silent clipboard write (F5) - and the element colours that encode
 * identity had no key at all (F11).
 *
 * This bar is a read-only view of state `ThreeDEditor` already holds. It never mutates the
 * material, so it cannot perturb the edit path, and its right-hand region doubles as the
 * component's only `aria-live` region.
 */

/** A basis element entry is a bare symbol in some fixtures and a `{ value }` cell in others. */
type ElementEntry = string | { value?: string; element?: string };

interface LatticeLike {
    type?: string;
    unitCell?: Record<string, number>;
}

interface BasisLike {
    elements?: ElementEntry[];
    units?: string;
}

export interface MaterialLike {
    formula?: string;
    unitCellFormula?: string;
    name?: string;
    basis?: BasisLike;
    Lattice?: LatticeLike;
}

export interface StatusBarProps {
    material?: MaterialLike | null;
    /** Selected atomic indices, per the mixin's multi-select contract. */
    selectedAtomIndices?: number[];
    /** Symbol of the single selected atom, when there is exactly one. */
    selectedElement?: string;
    /** Latest measurement readout, e.g. `"d = 2.351 Å"`. Null hides the slot. */
    measurement?: string | null;
    /** Click a composition chip. Omit to render the chips as a plain legend. */
    onSelectElement?: (elementSymbol: string) => void;
}

export function normalizeElement(entry: ElementEntry | undefined): string {
    if (!entry) return "";
    if (typeof entry === "string") return entry;
    return entry.value || entry.element || "";
}

/** Element symbols in first-appearance order with their counts - the composition legend. */
export function getComposition(material?: MaterialLike | null): [string, number][] {
    const elements = material?.basis?.elements;
    if (!Array.isArray(elements)) return [];
    const counts = new Map<string, number>();
    elements.forEach((entry) => {
        const symbol = normalizeElement(entry);
        if (symbol) counts.set(symbol, (counts.get(symbol) || 0) + 1);
    });
    return Array.from(counts.entries());
}

const norm = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);

/**
 * Lattice constants from the cell vectors rather than from a `Lattice` getter: the vectors are
 * the one representation every code path here already relies on (`Lattice.unitCell` drives
 * add-atom placement and the viewer's own cell object), so this cannot disagree with what is
 * drawn.
 */
export function getLatticeSummary(material?: MaterialLike | null): string {
    const cell = material?.Lattice?.unitCell;
    const type = material?.Lattice?.type;
    if (!cell) return type || "";
    const { ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0, cx = 0, cy = 0, cz = 0 } = cell;
    const a = norm(ax, ay, az);
    const b = norm(bx, by, bz);
    const c = norm(cx, cy, cz);
    if (!a && !b && !c) return type || "";
    const round = (value: number) => value.toFixed(3);
    // Collapse a = b = c to a single figure; showing "5.431 · 5.431 · 5.431" is noise.
    const isCubicLength = Math.abs(a - b) < 1e-4 && Math.abs(b - c) < 1e-4;
    const lengths = isCubicLength
        ? `a = ${round(a)} Å`
        : `a, b, c = ${round(a)}, ${round(b)}, ${round(c)} Å`;
    return [type, lengths].filter(Boolean).join(" · ");
}

/** Splits "Si8O16" into symbol/count pairs so the counts can render as subscripts. */
export function tokenizeFormula(formula: string): [string, string][] {
    const tokens: [string, string][] = [];
    const pattern = /([A-Z][a-z]?)(\d*)/g;
    let match = pattern.exec(formula);
    while (match) {
        if (match[1]) tokens.push([match[1], match[2] || ""]);
        match = pattern.exec(formula);
    }
    return tokens;
}

/**
 * `elementColors` values are CSS strings in the periodic-table package but numeric hex in
 * some overrides, so accept both rather than trusting one.
 */
function toCssColor(value: unknown): string {
    if (typeof value === "number") return `#${value.toString(16).padStart(6, "0")}`;
    if (typeof value === "string") return value.startsWith("#") ? value : `#${value}`;
    return settings.defaultColor;
}

function FormulaText({ formula }: { formula: string }) {
    const tokens = tokenizeFormula(formula);
    // A formula the tokenizer cannot read (an empty string, or a name that is not a formula at
    // all) still renders verbatim rather than vanishing.
    const parts: [string, string][] = tokens.length ? tokens : [[formula, ""]];
    return (
        <>
            {parts.map(([symbol, count], index) => (
                // Position *is* the identity here - a formula like "SiOSi" repeats symbols, so
                // there is no stabler key than where the token sits.
                // eslint-disable-next-line react/no-array-index-key
                <React.Fragment key={`${symbol}${count}-${index}`}>
                    {symbol}
                    {count && (
                        <Box component="sub" sx={{ fontSize: "0.72em", lineHeight: 0 }}>
                            {count}
                        </Box>
                    )}
                </React.Fragment>
            ))}
        </>
    );
}

function StatusBar(props: StatusBarProps) {
    const {
        material,
        selectedAtomIndices = [],
        selectedElement = "",
        measurement = null,
        onSelectElement,
    } = props;
    const theme = useTheme();

    const composition = useMemo(() => getComposition(material), [material]);
    const latticeSummary = useMemo(() => getLatticeSummary(material), [material]);

    const atomCount = material?.basis?.elements?.length || 0;
    const formula = material?.formula || material?.unitCellFormula || "";
    const units = material?.basis?.units === "cartesian" ? "cartesian, Å" : "crystal";

    let selectionText = "";
    if (selectedAtomIndices.length === 1) {
        const [index] = selectedAtomIndices;
        selectionText = `${selectedElement || "atom"} #${index} selected`;
    } else if (selectedAtomIndices.length > 1) {
        selectionText = `${selectedAtomIndices.length} atoms selected`;
    }

    const facts = [
        atomCount ? `${atomCount} atom${atomCount === 1 ? "" : "s"}` : "",
        latticeSummary,
        units,
    ].filter(Boolean);

    return (
        <Stack
            data-name="StatusBar"
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
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
            }}
        >
            {formula && (
                <Typography variant="caption" fontWeight="bold" data-name="StatusBarFormula">
                    <FormulaText formula={formula} />
                </Typography>
            )}

            {Boolean(facts.length) && (
                <Typography variant="caption" color="text.secondary">
                    {facts.join(" · ")}
                </Typography>
            )}

            <Stack direction="row" spacing={0.5} sx={{ pointerEvents: "auto" }}>
                {composition.map(([symbol, count]) => {
                    const swatch = toCssColor(
                        (settings.elementColors as Record<string, unknown>)?.[symbol],
                    );
                    const chip = (
                        <Stack
                            key={symbol}
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            data-name={`StatusBarChip-${symbol}`}
                            onClick={onSelectElement ? () => onSelectElement(symbol) : undefined}
                            sx={{
                                px: 0.75,
                                py: 0.125,
                                borderRadius: "11px",
                                border: `1px solid ${theme.palette.divider}`,
                                cursor: onSelectElement ? "pointer" : "default",
                                "&:hover": onSelectElement
                                    ? { borderColor: theme.palette.primary.main }
                                    : undefined,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    backgroundColor: swatch,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography variant="caption">{`${symbol} ${count}`}</Typography>
                        </Stack>
                    );
                    return onSelectElement ? (
                        <Tooltip key={symbol} title={`Select all ${count} ${symbol} atoms`}>
                            {chip}
                        </Tooltip>
                    ) : (
                        chip
                    );
                })}
            </Stack>

            {/* Selection and measurement are the only values here that change in response to a
                user action, so this is the region a screen reader should follow (F9). */}
            <Stack
                direction="row"
                spacing={1.5}
                sx={{ marginLeft: "auto !important" }}
                aria-live="polite"
                aria-atomic="true"
                data-name="StatusBarLive"
            >
                {selectionText && <Typography variant="caption">{selectionText}</Typography>}
                {measurement && (
                    <Typography variant="caption" color="warning.main">
                        {measurement}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}

export default StatusBar;
