import GL from "gl";
import {Made} from "made.js";
import * as THREE from "three";
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import {Wave} from "../src/wave";
import {createElement} from "./utils";
import {ELEMENT_PROPERTIES, HEIGHT, WIDTH} from "./enums";

// tell jest to wait more for async functions to resolve/reject.
jest.setTimeout(30000); // 30s

// configure enzyme adapter
configure({adapter: new Adapter()});

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
