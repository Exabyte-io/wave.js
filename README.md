[![npm version](https://badge.fury.io/js/%40exabyte-io%2Fwave.js.svg)](https://badge.fury.io/js/%40exabyte-io%2Fwave.js)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# Wave.js

**W**eb-based **A**tomic **V**iewer and **E**ditor in **J**ava**S**cript. Wave.js is a library for atomic visualization and editing written in JavaScript enabling visualization of material structures from atoms up on the web.

The library was originally designed as part of and presently powers materials design capabilities of the [Mat3ra.com](https://exabyte.io) platform.

## 1. Functionality.

As below:

- the package provides a web environment for the visualization of atomic structures and is written in ECMAScript 2015 (ES6) for use on the web
- ESSE Data Convention is employed to organize and store information [[1]](#links) via [Made.js](https://github.com/mat3ra/made)
- [THREE.js](https://threejs.org/) is used for 3d visualization purposes
- High-level classes for the representation of the [viewer](src/wave.js) and modular ES6-compatible mixins for the associated functionality, ie:
    - [Atoms](src/mixins/atoms.ts), 
    - [Cell](src/mixins/cell.js),
    - [Controls](src/mixins/controls.js),
    - [Mouse](src/mixins/mouse.js),
    - and others to be added.
- wrapper components for [React](https://reactjs.org/):
    - [ThreeDEditor](src/components/ThreeDEditor.js), with control trigger button panels
    - [WaveComponent](src/components/WaveComponent.js),

The package is written in a modular way easy to extend. Contributions can be in the form of additional functionality modules developed, or feature requests and [bug/issue reports](https://help.github.com/articles/creating-an-issue/).

## 2. Installation.

From NPM for use within a software project:

```bash
npm install @exabyte-io/wave.js

```

From source to contribute to development:

```bash
git clone git@github.com:Exabyte-io/wave.git
```

## 3. Contribution.

This repository is an [open-source](LICENSE.md) work-in-progress and we welcome contributions.

### 3.1. Adding new functionality.

We suggest forking this repository and introducing the adjustments there to be considered for merging into this repository as explained in more details [here](https://gist.github.com/Chaser324/ce0505fbed06b947d962), for example.

### 3.2. Source code conventions.

Wave.js is written in EcmaScript 6th edition [[2]](#links) with the application of object-oriented design patterns encapsulating key concepts following the conventions below.

1. One main class exposing the functionality with a set of mixins (implemented through [mixwith](https://www.npmjs.com/package/mixwith)) containing domain-specific functionality inside `mixins` folder 

2. The implementation of the viewer uses a native HTML node to initialize a Three.js rendering context, `components` folder further contains the wrapper React components for convenient use in web applications.

### 3.3. TODO list.

Desirable features for implementation:

- React Three Fiber
- scripting console
- other (TBA)


## 4. Development.

There are two types of tests: asserting Wave class functionality and testing React components.
Wave class tests use snapshot testing in which an snapshot of the WebGL [[3]](#links) context
is taken and compared with the reference. The test will fail if the two snapshots do not match.
This is admittedly a bit fragile, and future work may improve the test coverage such that this
is no longer necessary. React component tests use Enzyme [[4]](#links) that makes DOM manipulation
and traversal easier.

Note that snapshots may be slightly different depending on operating systems leading to comparison with a tolerance. 
A `docker-compose.yml` is provided for convenience. To run the tests, execute the following commands:

```bash

docker-compose build
docker-compose run test

or directly, on a host:

```bash

npm install
npm test
```

### 4.1. Important Notes.

1. Keep the tests directory structure similar to the main codebase directory structure. Every JS module in the main codebase should have a corresponding module in tests directory which implements the tests for provided functionality.

2. Add tests fixtures into [fixtures](./tests/fixtures) directory. The fixtures will be automatically stored on Git LFS [[6]](#links).

3. Add Jest configuration into [setupFiles](./tests/setupFiles.js) module.

4. Use [setupFilesAfterEnv](./tests/setupFilesAfterEnv.js) module to implement tests hooks.

5. Make sure to use `async` keyword for Wave class tests as they are asynchronous.

### 4.2. Dependencies.

This package depends on [Made.js](https://github.com/mat3ra/made), as well as a slightly [modified version of Three.js](https://github.com/Exabyte-io/three.js/commits/v0.90.0). See [package.json](package.json) for the full list.

### 4.3. Using `cove.js` for local development

In case you need to link Cove.js into the app for local development you need

1. Add local path of Cove.js to package.json
```bash
    "@exabyte-io/cove.js": "file:../../cove.js"
```
2. Run the app
```bash
    npm start
```

If you need to re-link it again, remove node_modules in cove.js and the app, run npm install, then run npm start again.


## 5. Links.

1. [Exabyte Source of Schemas and Examples (ESSE), Github Repository](https://github.com/exabyte-io/exabyte-esse)
1. [ECMAScript 2015 Language Specifications](https://www.ecma-international.org/ecma-262/6.0/)

1. [Headless GL, Github Repo](https://github.com/stackgl/headless-gl)
1. [Enzyme, A JavaScript Testing Utility For React, Github Repo](https://github.com/airbnb/enzyme)
1. [Jest Testing Framework, Official Website](https://jestjs.io/index.html)
1. [Git LFS, Official Website](https://git-lfs.github.com/)
