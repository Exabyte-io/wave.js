# WAVE

Web-based Atomic Viewer by Exabyte.

## Tests

There are two types of tests in Wave, the tests that assert Wave class functionality and the ones which tests the React components. Wave class tests use snapshot testing in which an snapshot of the WebGL [1](#links) context is taken and compared with the reference. The test will fail if the two snapshots do not match. React component tests use Enzyme [2](#links) that makes DOM manipulation and traversal easier.

In order to make the tests continuously pass locally and on the CI, the tests should be executed in the same environment as the snapshots may be slightly different on different operating systems. We recommend to use Docker container or Vagrant VM with CentOS 7.2 as OS to execute the tests. Wave tests are written based on Jest [3](#links) testing framework and can be executed as below.

```bash
sh run-tests.sh
```

### Tests Important Notes

1. Keep the tests directory structure similar to the main codebase directory structure. Every JS module in the main codebase should have a corresponding module in tests directory which implements the tests for provided functionality.

1. Add tests fixtures into [fixtures](./tests/fixtures) directory. The fixtures will be automatically stored on Git LFS [4](#links).

2. Add Jest configuration into [setupFiles](./tests/setupFiles.js) module.

3. Use [setupFilesAfterEnv](./tests/setupFilesAfterEnv.js) module to implement tests hooks.

4. Make sure to use `async` keyword for Wave class tests as they are asynchronous.


## Links

1. [Headless GL, Github Repo](https://github.com/stackgl/headless-gl)
2. [Enzyme, A JavaScript Testing Utility For React, Github Repo](https://github.com/airbnb/enzyme)
3. [Jest Testing Framework, Official Website](https://jestjs.io/index.html)
4. [Git LFS, Official Website](https://git-lfs.github.com/)
