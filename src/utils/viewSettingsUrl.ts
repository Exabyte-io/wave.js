import settings from "../settings";

/**
 * View settings that can be passed via URL query parameters.
 * Includes both numeric "viewerSettings" values and boolean toggle settings.
 */
export interface ViewSettingsFromUrl {
    // Numeric settings (merged into viewerSettings state)
    atomRadiiScale?: number;
    repetitionsAlongLatticeVectorA?: number;
    repetitionsAlongLatticeVectorB?: number;
    repetitionsAlongLatticeVectorC?: number;
    chemicalConnectivityFactor?: number;
    isViewAdjustable?: boolean;

    // Toggle settings (applied imperatively after Wave mount)
    orthographicCamera?: boolean;
    bonds?: boolean;
    axes?: boolean;
    autoRotate?: boolean;
    elementLabels?: boolean;
    coordinateLabels?: boolean;
    conventionalCell?: boolean;
}

/** Registry of recognized URL param names, their types, and how they map to ViewSettingsFromUrl keys. */
const PARAM_PARSERS: Record<
    string,
    { key: keyof ViewSettingsFromUrl; type: "number" | "boolean" }
> = {
    atomRadiiScale: { key: "atomRadiiScale", type: "number" },
    repetitions: { key: "repetitionsAlongLatticeVectorA", type: "number" }, // handled specially
    chemicalConnectivityFactor: { key: "chemicalConnectivityFactor", type: "number" },
    connectivityFactor: { key: "chemicalConnectivityFactor", type: "number" }, // alias
    isViewAdjustable: { key: "isViewAdjustable", type: "boolean" },
    orthographicCamera: { key: "orthographicCamera", type: "boolean" },
    bonds: { key: "bonds", type: "boolean" },
    axes: { key: "axes", type: "boolean" },
    autoRotate: { key: "autoRotate", type: "boolean" },
    elementLabels: { key: "elementLabels", type: "boolean" },
    coordinateLabels: { key: "coordinateLabels", type: "boolean" },
    conventionalCell: { key: "conventionalCell", type: "boolean" },
};

function parseNumber(value: string): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(value: string): boolean | undefined {
    if (value === "true" || value === "1") return true;
    if (value === "false" || value === "0") return false;
    return undefined;
}

/**
 * Parse URL query parameters into a ViewSettingsFromUrl object.
 * Unknown or invalid parameters are silently ignored.
 *
 * The `repetitions` param supports two formats:
 *   - Single number (e.g. `repetitions=2`) → applied to all three axes
 *   - Comma-separated (e.g. `repetitions=2,3,1`) → A=2, B=3, C=1
 *
 * Accepts values as strings (from URLSearchParams) or pre-parsed types
 * (from Iron Router's getQueryWithParsedBooleansFromRoute which converts
 * "true"/"false" strings to actual booleans).
 *
 * @param params - key-value pairs from URL query string
 */
export function parseViewSettingsFromUrlParams(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>,
): ViewSettingsFromUrl {
    const result: ViewSettingsFromUrl = {};

    Object.entries(params).forEach(([paramName, rawValue]) => {
        if (rawValue === undefined || rawValue === "") return;

        const valueStr = String(rawValue);

        // Special handling for `repetitions` (comma-separated or single number)
        if (paramName === "repetitions") {
            const parts = valueStr.split(",").map((s) => s.trim());
            if (parts.length === 1) {
                const n = parseNumber(parts[0]);
                if (n !== undefined && n >= 1) {
                    result.repetitionsAlongLatticeVectorA = n;
                    result.repetitionsAlongLatticeVectorB = n;
                    result.repetitionsAlongLatticeVectorC = n;
                }
            } else if (parts.length === 3) {
                const [a, b, c] = parts.map(parseNumber);
                if (a !== undefined && a >= 1) result.repetitionsAlongLatticeVectorA = a;
                if (b !== undefined && b >= 1) result.repetitionsAlongLatticeVectorB = b;
                if (c !== undefined && c >= 1) result.repetitionsAlongLatticeVectorC = c;
            }
            return;
        }

        const parser = PARAM_PARSERS[paramName];
        if (!parser) return;

        if (parser.type === "number") {
            const n = parseNumber(valueStr);
            if (n !== undefined) {
                (result as Record<string, unknown>)[parser.key] = n;
            }
        } else if (parser.type === "boolean") {
            // Accept pre-parsed booleans (from Iron Router) or string values
            if (typeof rawValue === "boolean") {
                (result as Record<string, unknown>)[parser.key] = rawValue;
            } else {
                const b = parseBoolean(valueStr);
                if (b !== undefined) {
                    (result as Record<string, unknown>)[parser.key] = b;
                }
            }
        }
    });

    return result;
}

/**
 * Serialize a ViewSettingsFromUrl object back to URL query parameter key-value pairs.
 * Only includes values that differ from defaults. Useful for future two-way sync.
 */
export function serializeViewSettingsToUrlParams(
    viewSettings: ViewSettingsFromUrl,
): Record<string, string> {
    const params: Record<string, string> = {};

    if (
        viewSettings.atomRadiiScale !== undefined &&
        viewSettings.atomRadiiScale !== settings.atomRadiiScale
    ) {
        params.atomRadiiScale = String(viewSettings.atomRadiiScale);
    }

    if (
        viewSettings.chemicalConnectivityFactor !== undefined &&
        viewSettings.chemicalConnectivityFactor !== settings.chemicalConnectivityFactor
    ) {
        params.chemicalConnectivityFactor = String(viewSettings.chemicalConnectivityFactor);
    }

    // Serialize repetitions as comma-separated if any differ from default
    const repA = viewSettings.repetitionsAlongLatticeVectorA;
    const repB = viewSettings.repetitionsAlongLatticeVectorB;
    const repC = viewSettings.repetitionsAlongLatticeVectorC;
    if (repA !== undefined || repB !== undefined || repC !== undefined) {
        const a = repA ?? settings.repetitions;
        const b = repB ?? settings.repetitions;
        const c = repC ?? settings.repetitions;
        if (
            a !== settings.repetitions ||
            b !== settings.repetitions ||
            c !== settings.repetitions
        ) {
            if (a === b && b === c) {
                params.repetitions = String(a);
            } else {
                params.repetitions = `${a},${b},${c}`;
            }
        }
    }

    // Boolean toggle settings — only include when true (since defaults are false)
    const booleanParams: Array<{ key: keyof ViewSettingsFromUrl; urlKey: string }> = [
        { key: "orthographicCamera", urlKey: "orthographicCamera" },
        { key: "bonds", urlKey: "bonds" },
        { key: "axes", urlKey: "axes" },
        { key: "autoRotate", urlKey: "autoRotate" },
        { key: "elementLabels", urlKey: "elementLabels" },
        { key: "coordinateLabels", urlKey: "coordinateLabels" },
        { key: "conventionalCell", urlKey: "conventionalCell" },
    ];
    booleanParams.forEach(({ key, urlKey }) => {
        if (viewSettings[key] !== undefined) {
            params[urlKey] = String(viewSettings[key]);
        }
    });

    if (
        viewSettings.isViewAdjustable !== undefined &&
        viewSettings.isViewAdjustable !== settings.isViewAdjustable
    ) {
        params.isViewAdjustable = String(viewSettings.isViewAdjustable);
    }

    return params;
}
