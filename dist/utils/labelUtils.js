/**
 * Sets multiple parameters on a canvas or context object
 * @param {Object} target - The canvas or context to set parameters on
 * @param {Object} params - Key-value pairs of parameters to set
 */
export const setParameters = (target, params) => {
    Object.entries(params).forEach(([key, value]) => {
        // eslint-disable-next-line no-param-reassign
        target[key] = value;
    });
};
