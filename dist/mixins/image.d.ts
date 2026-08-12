export function ImageMixin(superclass: any): {
    new (): {
        [x: string]: any;
        takeScreenshot(): void;
        getScreenshotImage(): any;
        /**
         * Largest drawing buffer this GL context will actually render, so an over-large request is
         * scaled down before it becomes a blank image rather than after.
         */
        getMaxFigureDimension(): number;
        /**
         * World units (Ångström) spanned by one image pixel, which is what a scale bar needs.
         *
         * Exact for the orthographic camera. For the perspective camera it is exact only in the
         * plane through the orbit target, since a perspective projection has no single scale - the
         * export dialog says so rather than presenting an approximation as a measurement.
         */
        getWorldUnitsPerPixel(pixelHeight: any): number;
        /**
         * Whether a line's colour is viewer chrome rather than data.
         *
         * The rule is "light and achromatic": the unit cell is `#CCCCCC` and the axes indicator is
         * `#FFFFFF`, both drawn to be seen against the dark viewer and both invisible on a white
         * page. Anything with a hue is carrying meaning - boundary-condition lines are amber and
         * blue by type - and anything dark already reads on a light background, so neither is
         * touched. Stated as a property of the colour so a new piece of chrome inherits it.
         */
        isChromeLineColor(color: any): boolean;
        /**
         * Recolours the viewer's chrome - text label sprites and chrome-coloured lines - and returns
         * a function restoring every colour it changed.
         *
         * Atoms are Meshes, so element colours are left alone by construction. Label sprites hold
         * near-white text in their texture, so multiplying by the target through `material.color`
         * recolours the glyphs without redrawing any texture.
         */
        applyFigureForeground(color: any): () => void;
        /**
         * Renders the scene once at an explicit size and background and returns a PNG data URL,
         * leaving the on-screen viewer exactly as it was.
         *
         * Chrome is excluded for free: this reads the WebGL canvas, and the toolbars, status bar and
         * inspector are DOM siblings of it, not part of the scene.
         *
         * @param width {Number} output width in pixels
         * @param height {Number} output height in pixels
         * @param background {String} a FigureBackgroundId - "viewer", "white" or "transparent"
         * @param includeScaleBar {Boolean} draw a scale bar into the bottom-left corner
         */
        getFigureImage({ width, height, background, includeScaleBar }?: number): any;
        /**
         * Copies the rendered frame onto a 2D canvas and draws the scale bar there. Drawing it into
         * the scene instead would make it a 3D object subject to the projection - it has to be a
         * fixed number of image pixels to mean anything.
         */
        composeFigureWithScaleBar({ width, height, backgroundOption }: {
            width: any;
            height: any;
            backgroundOption: any;
        }): any;
        /** Renders a figure and downloads it, named after the structure and the size used. */
        exportFigure(options?: {}): string;
        updateScene(): Promise<any>;
        createRotatingGifData(options?: {}): Promise<any>;
        takeGifScreenshot(options?: {}): Promise<void>;
    };
    [x: string]: any;
};
