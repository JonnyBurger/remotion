# Testing

For general information concerning contribution, please consult [CONTRIBUTION.md](./CONTRIBUTING.md).

### Core Coverage

![statements](https://img.shields.io/badge/Coverage_statements-79.22%25-yellow.svg)
![branches](https://img.shields.io/badge/Coverage_branches-74.07%25-yellow.svg)
![functions](https://img.shields.io/badge/Coverage_functions-63.9%25-red.svg)
![lines](https://img.shields.io/badge/Coverage_lines-78.1%25-yellow.svg)

### Running tests

There are tests in each package as well as end-to-end tests in the root of the monorepo. Run `npm test` in a package, or in the root to run all tests. Run `npx jest` to only run unit tests and skip linting.

### Mutation Testing

In case you want to check the quality of your test code while contributing, you can use mutation testing with the help of the [Stryker Mutator](https://stryker-mutator.io/).

#### Stryker Setup

To setup mutation testing in the core package, cd to the `packages/core`directory and then run `npm i @stryker-mutator/core @stryker-mutator/jest-runner`. Further, add a `stryker.conf.json` file in the same directory.

**Example stryker.conf.json:**

    {
        "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
        "packageManager": "npm",
        "reporters": [ "html", "clear-text", "progress" ],
         "testRunner": "jest",
         "mutate": [
         // specify files to mutate!
    	     "src/interpolate.ts",
    	     "src/volume-prop.ts",
    	     "src/config/codec.ts",
    	     "src/config/image-format.ts"
    	     ],
        "coverageAnalysis": "off"
    }

Under `"mutate"` you can specify the files you want stryker to mutate for you.
Then to run the mutation tests use `npx stryker run`.
In case you run into error on _Windows_ where Stryker and Jest won't run any test cases, try one of these [workarounds](https://github.com/stryker-mutator/stryker-js/issues/2122#issuecomment-605783668).
After running Stryker you can find the report under `packages/core/reports/mutation` and see how many mutants have been killed by your test cases and how many have survived.

Once you have checked your test code quality with the help of mutation testing, make sure to omit any Stryker related changes from your code before contributing.
