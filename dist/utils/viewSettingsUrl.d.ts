/**
 * View settings that can be passed via URL query parameters.
 * Includes both numeric "viewerSettings" values and boolean toggle settings.
 */
export interface ViewSettingsFromUrl {
    atomRadiiScale?: number;
    repetitionsAlongLatticeVectorA?: number;
    repetitionsAlongLatticeVectorB?: number;
    repetitionsAlongLatticeVectorC?: number;
    chemicalConnectivityFactor?: number;
    isViewAdjustable?: boolean;
    orthographicCamera?: boolean;
    bonds?: boolean;
    axes?: boolean;
    autoRotate?: boolean;
    elementLabels?: boolean;
    coordinateLabels?: boolean;
    conventionalCell?: boolean;
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
export declare function parseViewSettingsFromUrlParams(params: Record<string, any>): ViewSettingsFromUrl;
/**
 * Serialize a ViewSettingsFromUrl object back to URL query parameter key-value pairs.
 * Only includes values that differ from defaults. Useful for future two-way sync.
 */
export declare function serializeViewSettingsToUrlParams(viewSettings: ViewSettingsFromUrl): Record<string, string>;
