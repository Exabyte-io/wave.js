# Wave.js

**W**eb-based **A**tomic **V**iewer and **E**ditor in **J**ava**S**cript. Wave.js is a library for atomic visualization and editing written in JavaScript enabling visualization of material structures from atoms up on the web. The library is aimed to be used for the development of web applications in JavaScript.

The library was originally designed as part of and presently powers materials design capabilities of the [Exabyte.io](https://exabyte.io) platform. For example, [this page](https://platform.exabyte.io/demo/materials/n3HSzCmyoctgJFGGE) representing a crystal of Silicon online uses Wave.js.

Exabyte.io believe in a collaborative future of materials design on the web.

## Functionality

As below:

- the package provides a web environment for the visualization of atomic structures and is written in ECMAScript 2015 (ES6) for use on the web
- ESSE Data Convention is employed to organize and store information [[1]](#links) via [Made.js](https://github.com/exabyte-io/made-js)
- [THREE.js](https://threejs.org/) is used for 3d visualization purposes
- High-level classes for the representation of the [viewer](src/wave.js) and modular ES6-compatible mixins for the associated functionality, ie:
    - [Atoms](src/mixins/atoms.js), 
    - [Cell](src/mixins/cell.js),
    - [Controls](src/mixins/controls.js),
    - [Mouse](src/mixins/mouse.js),
    - and others to be added.
- wrapper components for [React](https://reactjs.org/):
    - [ThreeDEditor](src/components/ThreeDEditor.js), with control trigger button panels
    - [WaveComponent](src/components/WaveComponent.js),

The package is written in a modular way easy to extend. Contributions can be in the form of additional functionality modules developed, or feature requests and [bug/issue reports](https://help.github.com/articles/creating-an-issue/).

## Installation

From NPM for use within a software project:

```bash
npm install @exabyte-io/wave.js

```

From source to contribute to development:

```bash
git clone git@github.com:Exabyte-io/wave.git
```

## Contribution

This repository is an [open-source](LICENSE.md) work-in-progress and we welcome contributions.

### Why contribute?

We regularly deploy the latest code containing all accepted contributions online as part of the [Exabyte.io](https://exabyte.io) platform, so contributors will see their code in action there.

### Adding new functionality

We suggest forking this repository and introducing the adjustments there to be considered for merging into this repository as explained in more details [here](https://gist.github.com/Chaser324/ce0505fbed06b947d962), for example.

### Source code conventions

Wave.js is written in EcmaScript 6th edition [[2]](#links) with the application of object-oriented design patterns encapsulating key concepts following the conventions below.

1. One main class exposing the functionality with a set of mixins (implemented through [mixwith](https://www.npmjs.com/package/mixwith)) containing domain-specific functionality inside `mixins` folder 

2. The implementation of the viewer uses a native HTML node to initialize a Three.js rendering context, `components` folder further contains the wrapper React components for convenient use in web applications.


### TODO list

Desirable features for implementation:

- selection buffers
- scripting console
- other (TBA)
    

## Tests

There are two types of tests: asserting Wave class functionality and testing React components. Wave class tests use snapshot testing in which an snapshot of the WebGL [[3]](#links) context is taken and compared with the reference. The test will fail if the two snapshots do not match. React component tests use Enzyme [[4]](#links) that makes DOM manipulation and traversal easier.

In order to make the tests continuously pass locally and on the CI, the tests should be executed in the same environment as the snapshots may be slightly different on different operating systems. We recommend to use Docker container or Vagrant VM with CentOS 7.2 as OS to execute the tests. Wave tests are written based on Jest [[5]](#links) framework and can be executed as below.

```bash
sh run-tests.sh
```

### Important Notes

1. Keep the tests directory structure similar to the main codebase directory structure. Every JS module in the main codebase should have a corresponding module in tests directory which implements the tests for provided functionality.

2. Add tests fixtures into [fixtures](./tests/fixtures) directory. The fixtures will be automatically stored on Git LFS [[6]](#links).

3. Add Jest configuration into [setupFiles](./tests/setupFiles.js) module.

4. Use [setupFilesAfterEnv](./tests/setupFilesAfterEnv.js) module to implement tests hooks.

5. Make sure to use `async` keyword for Wave class tests as they are asynchronous.

## Dependencies

This package depends on [Made.js](https://github.com/Exabyte-io/made.js), as well as a slightly [modified version of Three.js](https://github.com/Exabyte-io/three.js/commits/v0.90.0). See [package.json](package.json) for the full list.

## Links

1. [Exabyte Source of Schemas and Examples (ESSE), Github Repository](https://github.com/exabyte-io/exabyte-esse)
1. [ECMAScript 2015 Language Specifications](https://www.ecma-international.org/ecma-262/6.0/)

1. [Headless GL, Github Repo](https://github.com/stackgl/headless-gl)
1. [Enzyme, A JavaScript Testing Utility For React, Github Repo](https://github.com/airbnb/enzyme)
1. [Jest Testing Framework, Official Website](https://jestjs.io/index.html)
1. [Git LFS, Official Website](https://git-lfs.github.com/)
