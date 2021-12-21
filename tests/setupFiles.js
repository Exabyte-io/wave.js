import GL from "gl";
import expect from 'expect'
import * as THREE from "three";
import {configure} from 'enzyme';
import {Made} from "@exabyte-io/made.js";
import Adapter from 'enzyme-adapter-react-15';
import {toBeDeepCloseTo, toMatchCloseTo} from 'jest-matcher-deep-close-to';

import {Wave} from "../src/wave";
import {createElement} from "./utils";
import {ELEMENT_PROPERTIES, HEIGHT, WIDTH} from "./enums";

// configure enzyme adapter
configure({adapter: new Adapter()});

// extend jest expect
expect.extend({
    toBeDeepCloseTo,
    toMatchCloseTo
});

/**
 * mock WebGLRenderer by headless GL.
 */
Wave.prototype.getWebGLRenderer = (config) => {
    const context = GL(WIDTH, HEIGHT, {preserveDrawingBuffer: true});
    // create a canvas element with mocked width/height otherwise the default with 0 width is used.
    const canvas = createElement("canvas", ELEMENT_PROPERTIES);
    return new THREE.WebGLRenderer({
        ...config,
        context,
        canvas
    })
};

document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
    },
});
