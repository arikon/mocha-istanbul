[![Dependency Status](https://david-dm.org/pocesar/grunt-mocha-istanbul.png?theme=shields.io)](https://david-dm.org/pocesar/grunt-mocha-istanbul)
[![Build Status](https://travis-ci.org/pocesar/grunt-mocha-istanbul.svg?branch=master)](https://travis-ci.org/pocesar/grunt-mocha-istanbul)

[![NPM](https://nodei.co/npm/grunt-mocha-istanbul.png?downloads=true&stars=true)](https://nodei.co/npm/grunt-mocha-istanbul/)

# grunt mocha istanbul task

> [Mocha](https://mochajs.org) reporter to generate coverage report of [istanbul](http://gotwarlost.github.com/istanbul/) instrumented code, for grunt

> This doesn't force you to use PhantomJS, or instrument code for server or client-side.

## Getting Started

1. Install needed dependencies using: `npm install grunt mocha istanbul --save-dev`
2. Install this package using: `npm install grunt-mocha-istanbul --save-dev`
3. Call inside `Gruntfile.js`: `grunt.loadNpmTasks('grunt-mocha-istanbul')`

### Compatible tools

Although it's intended for use with [Istanbul](https://github.com/gotwarlost/istanbul), you can freely
use this task with other command line compatible tool, by changing the `scriptPath` option, such as:

* [Ibrik](https://github.com/Constellation/ibrik)
* [Babel Istanbul](https://github.com/ambitioninc/babel-istanbul)
* [Isparta](https://github.com/douglasduteil/isparta)

```js
grunt.initConfig({
    mocha_istanbul: {
        target: {
            options: {
                scriptPath: require.resolve('coverage-tool/the/path/to/bin'), // usually in nameofcoveragelibrary/lib/cli
            }
        }
    }
});
```

#### Running ES2015+ tests with ES2015+ sources (through Babel-CLI)

Before anything, install babel required stuff.

```
npm install babel-cli babel-presets-2015 babel-register
```

Define your .babelrc file on the same level as Gruntfile.js

```json
{
    "presets": ["es2015"]
}
```

Then you'll need to use Isparta, until Istanbul 1.0 is released. (or you can use 1.0.0-alpha.2)

```js
{
    mocha_istanbul: {
        src: 'test',
        options: {
            scriptPath: require.resolve('isparta/lib/cli'),
            nodeExec: require.resolve('.bin/babel-node') // for Windows, you MUST use .bin/babel-node.cmd instead
            mochaOptions: ['--compilers', 'js:babel-register'], // if you are writing your tests with ES2015+ as well
        }
    }
}
```

NOTE: for some unknown reason, using babel-node as nodeExec, with `print` option makes it fail.

### Usage Examples

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
                    mask: '*.spec.js',
                    mochaOptions: ['--harmony','--async-only'], // any extra options
                    istanbulOptions: ['--harmony','--handle-sigint']
                }
            },
            coveralls: {
                src: ['test', 'testSpecial', 'testUnique'], // multiple folders also works
                options: {
                    coverage:true, // this will make the grunt.event.on('coverage') event listener to be triggered
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
        // Check below on the section "The coverage event"
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

### Options

Mochas parameters, check [https://mochajs.org/#usage](https://mochajs.org/#usage)

### Mocha options

### options.require

Type: `Array`

Default Value: `[]`

### options.ui

Type: `Boolean`

Default Value: `false`

### options.globals

Type: `Array`

Default Value: `[]`

### options.reporter

Type: `String`

Default Value: `false`

### options.timeout

Type: `Number`

Default Value: `false`

### options.slow

Type: `Boolean`

Default Value: `false`

### options.grep

Type: `String`

Default Value: `false`

### options.recursive

Type: `Boolean`

Default Value: `false`

### options.noColors

Type: `Boolean`

Default Value: `false`

### options.nodeOptions

Type: `Array`

Default Value: `false`

An array of strings, any additional node executable parameters, manually set.

Eg.: `nodeOptions: ['--throw-deprecation', '--require', 'some/module']`

### options.mask

Type: `String`

Default Value: `false`

The mask for the tests to be ran. By default, mocha will execute the `test` folder and all test files.
Will override any files specified in `src` and instead use the mask on those files' folders.

### options.mochaOptions

Type: `Array`

Default Value: `false`

An array of strings, any additional mocha parameters, manually set.

Eg.: `mochaOptions: ['--harmony', '-s', '100']`

### Istanbul options

### options.excludes

Type: `Array`

Default Value: `false`

Setting this exclude files from coverage report, check `istanbul help cover`. You may use glob matching in here.

### options.includes

Type: `Array`

Default Value: `false`

Setting this includes only those files in the coverage report, check `istanbul help cover`. You may use glob matching in here.

### options.istanbulOptions

Type: `Array`

Default Value: `false`

An array of strings, any additional istanbul parameters, manually set.

Eg.: `istanbulOptions: ['--harmony', '--handle-sigint', 'some=value', '-s', 'value']`

### options.coverageFolder

Type: `String`

Default Value: `'coverage'`

Name of the output of the coverage folder

#### options.reportFormats

Type: `Array`

Default Value: `['lcov']`

Name of report formats. You can specify more than one. If you intend to use the `coverage` option to
`true` or do any checks, you must add: `['yourformat','lcovonly']`, since it's needed for the `lcov.info`
file to be created.

[Supported formats](https://github.com/gotwarlost/istanbul#the-report-command):

> html - produces a bunch of HTML files with annotated source code

> lcovonly - produces an lcov.info file

> lcov - produces html + lcov files. This is the default format

> cobertura - produces a cobertura-coverage.xml file for easy Hudson integration

> text-summary - produces a compact text summary of coverage, typically to console

> text - produces a detailed text table with coverage for all files

> teamcity - produces service messages to report code coverage to TeamCity

### options.root

Type: `String`

Default Value: `false`

The root path to look for files to instrument, defaults to `.`. Can help to exclude directories that are not
part of the code whose coverage should be checked.

### options.print

Type: `String`

Default Value: `false`

The type of report to print to console. Can be one of 'summary', 'detail', 'both', or 'none'. By

Default, Istanbul will print the 'summary' report.

### Task options

### options.scriptPath

Type: `String`

Default Value: `'istanbulPath'`

Allows to override the default istanbul path to use another coverage library, such as [ibrik](https://www.npmjs.com/package/ibrik).
Need to set the full path to the bin (script that accepts stdin arguments) and is compatible with `cover`.

### options.coverage

Type: `Boolean`

Default Value: `false`

Setting this to `true` **makes the task emit a grunt event `coverage`**, that will contain the lcov data from
the file, containing the following callback `function(lcovcontent, done)`, and **you must manually call
`done()` when you are finished, else the grunt task will HANG, and won't allow any other tasks to finish**.
[See more information below](#the-coverage-event)

### options.dryRun

Type: `Boolean`

Default Value: `false`

Spits out the command line that would be called, just to make sure everything is alright

### options.nodeExec

Type: `String`

Default Value: `process.execPath`

Sets the node executable that will invoke Istanbul and Mocha. Useful for setting something else than node, like `babel-node`

### options.cwd

Type: `String`

Default Value: `process.cwd()`

Sets the current working directly. Note that changing this might have unexpected results, since the plugin and Grunt expects
to be working on the same level of `Gruntfile.js`

### options.quiet

Type: `Boolean`

Default Value: `false`

Suppresses the output from Mocha and Istanbul

### options.check.statements

Type: `Number`

Default Value: `false`

Number of statements threshold to consider the coverage valid

### options.check.lines

Type: `Number`

Default Value: `false`

Number of lines threshold to consider the coverage valid

### options.check.branches

Type: `Number`

Default Value: `false`

Number of branches threshold to consider the coverage valid

### options.check.functions

Type: `Number`

Default Value: `false`

Number of functions threshold to consider the coverage valid

### The coverage event

When you set the option `coverage` to `true`, you'll receive the `coverage/lcov.info` file contents:

```js
grunt.event.on('coverage', function(lcov, done){
    console.log(lcov);
    done(); // or done(false); in case of error
});
```

This is mainly useful so you can send it to, for example, coveralls (using [coveralls](https://github.com/nickmerwin/node-coveralls)):

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

## LICENSE

MIT
