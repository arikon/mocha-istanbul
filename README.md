[![Dependency Status](https://david-dm.org/pocesar/grunt-mocha-istanbul.png?theme=shields.io)](https://david-dm.org/pocesar/grunt-mocha-istanbul)

[![NPM](https://nodei.co/npm/grunt-mocha-istanbul.png?downloads=true&stars=true)](https://nodei.co/npm/grunt-mocha-istanbul/)

grunt mocha istanbul task
==============

[Mocha](http://visionmedia.github.com/mocha/) reporter to generate coverage report of [istanbul](http://gotwarlost.github.com/istanbul/) instrumented code, for grunt
This doesn't force you to use PhantomJS, or instrument code for server or client-side.

Install
==============

1. Install it using `npm install grunt-mocha-istanbul --save-dev`
2. It needs `mocha`, `grunt` and `istanbul` to be installed locally on your project (aka, having them in your devDependencies)
3. Call inside Gruntfile.js `grunt.loadNpmTasks('grunt-mocha-istanbul')`

Changes from 1.x
==============

Since Istanbul has 2 versions (ES5 and ES6/harmony), it's up to you to install the desired version of Istanbul,
it's now defined as a a peer dependency.

Introduced new task `istanbul_check_coverage` to enable coverage checking on more than one test run. See below for example.

Changes from 0.2.0
==============

* `mocha_istanbul_check` was removed and became part of the options under the `check` object


Options
==============

Most of the options that you pass to mocha is available in `options`:

```js

module.exports = function(grunt){
    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: 'test', // a folder works nicely
                options: {
                    mask: '*.spec.js'
                }
            },
            coverageSpecial: {
                src: ['testSpecial/*/*.js', 'testUnique/*/*.js'], // specifying file patterns works as well
                options: {
                    coverageFolder: 'coverageSpecial',
                    mask: '*.spec.js'
                }
            },
            coveralls: {
                src: ['test', 'testSpecial', 'testUnique'], // multiple folders also works
                options: {
                    coverage:true,
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['cobertura','lcovonly']
                }
            }
        },
        istanbul_check_coverage: {
          default: {
            options: {
              coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
              check: {
                lines: 80,
                statements: 80
              }
            }
          }
        }

    });

    grunt.event.on('coverage', function(lcovFileContents, done){
        // Check below
        done();
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('coveralls', ['mocha_istanbul:coveralls']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
```

If there's a `mocha.opts` file inside the first `src` folder or file defined, it will warn if you are overwriting any options.

Coverage is written to `coverage` folder by default, in the same level as the `Gruntfile.js`

The `check` will fail the build if the thresholds are not met. It's a great possibility for CI-builds.

Options
==============

##### _Array_ `options.require` (default: `[]`)
##### _Boolean_ `options.ui` (default: `false`)
##### _Array_ `options.globals` (default: `[]`)
##### _String_ `options.reporter` (default: `false`)
##### _Number_ `options.timeout` (default: `false`)
##### _Boolean_ `options.slow` (default: `false`)
##### _String_ `options.grep` (default: `false`)
##### _Boolean_ `options.recursive` (default: `false`)
##### _Boolean_ `options.noColors` (default: `false`)

Mochas parameters, check [http://visionmedia.github.io/mocha/#usage]

##### _Array_ `options.mochaOptions` (default: `false`)

Any additional mocha parameters, manually set

##### _Array_ `options.istanbulOptions` (default: `false`)

Any additional istanbul parameters, manually set

##### _String_ `options.scriptPath` (default: `istanbulPath`)

Allows to override the default istanbul path to use another coverage library, such as [ibrik](https://www.npmjs.com/package/ibrik). Need to set the full path to the bin (script that accepts stdin arguments) and is compatible with `cover`.

##### _Boolean_ `options.coverage` (default: `false`)

Setting this to true makes the task emit a grunt event `coverage`, that will contain the lcov data from
the file, containing the following callback `function(lcovcontent, done)`, and you must manually call
`done()` when you are finished, else the grunt task will hang. See more information below

##### _Boolean_ `options.dryRun` (default: `false`)

Spits out the command line that would be called, just to make sure everything is alright

##### _Array_ `options.excludes` (default: `false`)

Setting this exclude files from coverage report, check `istanbul help cover`. You may use glob matching in here.

##### _String_ `options.mask` (default: `false`)

The mask for the tests to be ran. By default, mocha will execute the `test` folder and all test files. Will override any files specified in `src` and instead use the mask on those files' folders.

##### _Boolean_ `options.quiet` (default: `false`)

Suppresses the output from Mocha and Istanbul

##### _String_ `options.coverageFolder` (default: `coverage`)

Name of the output of the coverage folder

##### _Array_ `options.reportFormats` (default: `['lcov']`)

Name of report formats. You can specify more than one. If you intend to use the `coverage` option to
`true` or do any checks, you must add: `['yourformat','lcovonly']`, since it's needed for the `lcov.info`
file to be created.

[Supported formats](https://github.com/gotwarlost/istanbul#the-report-command):

```
    html - produces a bunch of HTML files with annotated source code
    lcovonly - produces an lcov.info file
    lcov - produces html + lcov files. This is the default format
    cobertura - produces a cobertura-coverage.xml file for easy Hudson integration
    text-summary - produces a compact text summary of coverage, typically to console
    text - produces a detailed text table with coverage for all files
    teamcity - produces service messages to report code coverage to TeamCity
```

##### _String_ `options.root` (default: `false`)

The root path to look for files to instrument, defaults to `.`. Can help to exclude directories that are not
part of the code whose coverage should be checked.

##### _String_ `options.print` (default: `false`)

The type of report to print to console. Can be one of 'summary', 'detail', 'both', or 'none'. By
default, Istanbul will print the 'summary' report.

##### _Number_ `options.check.statements` (default: `false`)

Number of statements threshold to consider the coverage valid

##### _Number_ `options.check.lines` (default: `false`)

Number of lines threshold to consider the coverage valid

##### _Number_ `options.check.branches` (default: `false`)

Number of branches threshold to consider the coverage valid

##### _Number_ `options.check.functions` (default: `false`)

Number of functions threshold to consider the coverage valid

The coverage event
==============

When you set the option `coverage` to `true`, you'll receive the `coverage/lcov.info` file contents:

```js
grunt.event.on('coverage', function(lcov, done){
    console.log(lcov);
    done(); // or done(false); in case of error
});
```

This is mainly useful so you can send it to, for example, coveralls (using [coveralls](https://github.com/cainus/node-coveralls)):

```js
grunt.event.on('coverage', function(lcov, done){
    require('coveralls').handleInput(lcov, function(err){
        if (err) {
            return done(err);
        }
        done();
    });
});
```

This way, Travis-CI can send the Istanbul generated LCOV directly to Coveralls.io website in this example, but you could
create any transform for Jenkins, TeamCity, Hudson, etc.
