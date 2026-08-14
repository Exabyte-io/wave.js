import "jest-canvas-mock";

import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { configure } from "enzyme";
import expect from "expect";
import GL from "gl";
import { toBeDeepCloseTo, toMatchCloseTo } from "jest-matcher-deep-close-to";
import * as THREE from "three";
import { deserialize, serialize } from "v8";

import { Wave } from "../src/wave";
import { ELEMENT_PROPERTIES } from "./enums";
import { createElement, HEIGHT, WIDTH } from "./utils";

// Jest 27 jsdom does not provide structuredClone; @mat3ra/code deepClone requires it.
if (typeof global.structuredClone !== "function") {
    global.structuredClone = (value) => deserialize(serialize(value));
}

// configure enzyme adapter
configure({ adapter: new Adapter() });

// extend jest expect
expect.extend({
    toBeDeepCloseTo,
    toMatchCloseTo,
});

/**
 * mock WebGLRenderer by headless GL.
 */
Wave.prototype.getWebGLRenderer = (config) => {
    const context = GL(WIDTH, HEIGHT, { preserveDrawingBuffer: true });
    // create a canvas element with mocked width/height otherwise the default with 0 width is used.
    const canvas = createElement("canvas", ELEMENT_PROPERTIES);
    return new THREE.WebGLRenderer({
        ...config,
        context,
        canvas,
    });
};

window.setImmediate = window.setTimeout;
window.clearImmediate = window.clearTimeout;

/**
 * jsdom does not implement ResizeObserver (a real browser API); every real browser Wave.js
 * targets has it, so this is a test-environment polyfill, not a production fallback.
 */
class ResizeObserverMock {
    // eslint-disable-next-line class-methods-use-this
    observe() {}

    // eslint-disable-next-line class-methods-use-this
    unobserve() {}

    // eslint-disable-next-line class-methods-use-this
    disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;
global.ResizeObserver = ResizeObserverMock;
