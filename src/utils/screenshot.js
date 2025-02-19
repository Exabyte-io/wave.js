/**
 * Saves the current canvas state as a PNG image
 * @param {string} dataUrl - The data URL of the image to save
 */
export const saveImageDataToFile = (dataUrl) => {
    const link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = dataUrl;
    link.click();
};
