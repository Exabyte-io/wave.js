export function ImageMixin(superclass: any): {
    new (): {
        [x: string]: any;
        takeScreenshot(): void;
        getScreenshotImage(): any;
        updateScene(): Promise<any>;
        createRotatingGifData(options?: {}): Promise<any>;
        takeGifScreenshot(options?: {}): Promise<void>;
    };
    [x: string]: any;
};
