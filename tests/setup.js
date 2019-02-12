import GL from "gl";
import {Made} from "made.js";
import * as THREE from "three";
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import {Wave} from "../src/wave";
import {createElement} from "./utils";
import {ELEMENT_PROPERTIES, HEIGHT, WIDTH} from "./enums";

// make THREE globally available
global.THREE = THREE;

// configure enzyme adapter
configure({adapter: new Adapter()});

/**
 * mock WebGLRenderer by headless GL.
 */
Wave.prototype.getWebGLRenderer = (config) => {
    const context = GL(WIDTH, HEIGHT, {preserveDrawingBuffer: true});
    const canvas = createElement("canvas", ELEMENT_PROPERTIES);
    Object.defineProperty(context, 'canvas', {value: canvas});
    return new THREE.WebGLRenderer({
        ...config,
        context
    })
};
