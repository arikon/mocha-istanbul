# CHANGELOG

### 5.0

- Added Travis for tests
- Wrong non-array options now fail the task
- Better flexibility within the options for ES6 tests and source files
- Will try to manually expand minimatch patterns instead of relying on mocha and istanbul ones, so it's easier to debug when using `--verbose`
- `harmony` option is gone, you should select where you'd want it `nodeOptions`, `istanbulOptions`, etc
- Added the `include` option, to filter out the covered information

### 4.0

Peer dependencies for `mocha` and `istanbul` have been removed.  You should `npm install` the following modules yourself:

- `mocha`
- `istanbul` (or a compatible module; see `scriptPath` usage below)

If using `npm` version < 3, you will need to install `grunt` as well.

### 2.0

Since Istanbul has 2 versions (ES5 and ES6/harmony), it's up to you to install the desired version of Istanbul,
it's now defined as a a peer dependency.

Introduced new task `istanbul_check_coverage` to enable coverage checking on more than one test run. See below for example.

### 1.0.0

* `mocha_istanbul_check` was removed and became part of the options under the `check` object
