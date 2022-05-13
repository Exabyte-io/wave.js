import "jest-canvas-mock";

import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import expect from "expect";
import GL from "gl";
import { toBeDeepCloseTo, toMatchCloseTo } from "jest-matcher-deep-close-to";
import * as THREE from "@exabyte-io/three";

import { Wave } from "../src/wave";
import { ELEMENT_PROPERTIES } from "./enums";
import { createElement, HEIGHT, WIDTH } from "./utils";

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
