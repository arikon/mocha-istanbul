module.exports = function (grunt) {
    'use strict';

    var path = require('path');

    function getMochaPath() {
        try {
            return require.resolve('mocha/bin/_mocha');
        } catch (ignored) {
            grunt.fail.fatal('Mocha peer dependency missing.  Please "npm install mocha"');
        }
    }

    function getIstanbulPath() {
        try {
            return require.resolve('istanbul/lib/cli');
        } catch (ignored) {
            grunt.fail.fatal('Istanbul peer dependency missing.  Please "npm install istanbul"');
        }
    }

    function arrayOfStrings(options, name, exec) {
        if (Array.isArray(options)) {
            if (options.length) {
                exec(options);
            } else {
                grunt.verbose.ok('Skipping empty ' + name + ' array')
            }
        } else {
            grunt.fail.fatal(name + ' must be an array of strings');
        }
    }

    function defaultOptions() {
        return {
            require: [],
            ui: false,
            globals: [],
            reporter: false,
            timeout: false,
            coverage: false,
            slow: false,
            includes: false,
            grep: false,
            dryRun: false,
            quiet: false,
            recursive: false,
            mask: false,
            root: false,
            print: false,
            noColors: false,
            harmony: false,
            coverageFolder: 'coverage',
            cwd: process.cwd(),
            reportFormats: ['lcov'],
            check: {
                statements: false,
                lines: false,
                functions: false,
                branches: false
            },
            excludes: false,
            mochaOptions: false,
            istanbulOptions: false,
            nodeOptions: false,
            nodeExec: process.execPath
        };
    }

    function executeCheck(callback, coverageFolder, options) {
        var args = [], check = options.check;

        if (
            check.statements !== false ||
            check.lines !== false ||
            check.functions !== false ||
            check.branches !== false
            ) {
            args.push(options.scriptPath);
            args.push('check-coverage');
            if (check.lines) {
                args.push('--lines');
                args.push(check.lines);
            }
            if (check.statements) {
                args.push('--statements');
                args.push(check.statements);
            }
            if (check.functions) {
                args.push('--functions');
                args.push(check.functions);
            }
            if (check.branches) {
                args.push('--branches');
                args.push(check.branches);
            }

            args.push(coverageFolder + '/coverage*.json');

            grunt.verbose.ok('Will execute: ', options.nodeExec + ' ' + args.join(' '));

            if (!options.dryRun) {
                grunt.util.spawn({
                    cmd: options.nodeExec,
                    args: args,
                    opts: {
                        env: process.env,
                        cwd: options.cwd,
                        stdio: options.quiet ? 'ignore' : 'inherit'
                    }
                }, function (err) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    callback && callback(null, 'Done. Minimum coverage threshold succeeded.');
                });

                return;
            } else {
                callback && callback(null, 'Would also execute post cover: ' + options.nodeExec + ' ' + args.join(' '));
                return;
            }
        }

        callback && callback();
    }

    grunt.registerMultiTask('istanbul_check_coverage', 'Solo task for checking coverage over different or many files.', function () {
        var done = this.async();
        var options = this.options(defaultOptions());

        // only execute this function if no scriptPath is specified
        if (!options.scriptPath) {
            options.scriptPath = getIstanbulPath();
        }

        executeCheck(function (err, result) {
            if (err) { return done(err); }
            if (options.coverage) {
                var coverage = grunt.file.read(path.join(options.coverageFolder, 'lcov.info'));
                return grunt.event.emit('coverage', coverage, function (d) {
                    grunt.log.ok(result || 'Done. Check coverage folder.');
                    done(d);
                });
            }
            grunt.log.ok(result || 'Done. Check coverage folder.');
            done();
        }, options.coverageFolder, options);
    });

    grunt.registerMultiTask('mocha_istanbul', 'Generate coverage report with Istanbul from mocha test', function () {
        if (!this.filesSrc.length) {
            grunt.log.error('No test files to run');
            return;
        }

        var mochaPath = getMochaPath();
        var options = this.options(defaultOptions());
        var testsDir = grunt.file.isDir(this.filesSrc[0]) ? this.filesSrc[0] : path.dirname(this.filesSrc[0]);
        var coverageFolder = path.join(options.cwd, options.coverageFolder);
        var rootFolderForCoverage = options.root ? path.join(options.cwd, options.root) : '.';
        var done = this.async();
        var args = [];

        if (options.nodeOptions) {
            arrayOfStrings(options.nodeOptions, 'options.nodeOptions', function(options){
                options.forEach(function(nodeOption){
                    args.push(nodeOption);
                });
            })
        }

        if (!options.scriptPath) {
            options.scriptPath = getIstanbulPath();
        }

        if (options.harmony) {
            args.push('--harmony');
        }

        args.push(options.scriptPath);        // ie. node ./node_modules/istanbul/lib/cli.js or another script name
        args.push('cover');                   // node <scriptPath> cover


        if (options.excludes) {
            arrayOfStrings(options.excludes, 'options.excludes', function(options){
                options.forEach(function (excluded) {
                    args.push('-x');
                    args.push(excluded);
                });
            })
        }

        if (options.includes) {
            arrayOfStrings(options.includes, 'options.includes', function(options){
                options.forEach(function (included) {
                    args.push('-i');
                    args.push(included);
                });
            })
        }

        args.push('--dir', coverageFolder); // node ./node_modules/istanbul/cli.js --dir=coverage

        if (options.root) {
            args.push('--root', rootFolderForCoverage);
        }
        if (options.print) {
            args.push('--print', options.print);
        }

        options.reportFormats.forEach(function (format) {
            args.push('--report', format);
        });

        if (options.istanbulOptions) {
            arrayOfStrings(options.istanbulOptions, 'options.istanbulOptions', function(options){
                options.forEach(function (opt) {
                    args.push(opt);
                });
            })
        }

        args.push(mochaPath);                 // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha
        args.push('--');                      // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha --

        if (grunt.file.exists(options.cwd, testsDir, 'mocha.opts')) {
            if (
                options.require.length ||
                options.globals.length ||
                options.ui ||
                options.reporter ||
                options.timeout ||
                options.slow ||
                options.grep ||
                options.mask ||
                options.noColors
                ) {
                grunt.log.warn('Warning: mocha.opts exists, but overwriting with options');
            }
        }

        if (options.timeout) {
            args.push('--timeout');
            args.push(options.timeout);
        }

        if (options.require) {
            arrayOfStrings(options.require, 'options.require', function(options){
                options.forEach(function (require) {
                    grunt.file.expand({nonull: true}, require).forEach(function(expanded){
                        args.push('--require');
                        args.push(expanded);
                    })
                });
            });
        }

        if (options.ui) {
            args.push('--ui');
            args.push(options.ui);
        }

        if (options.noColors) {
            args.push('--no-colors');
        }

        if (options.reporter) {
            args.push('--reporter');
            args.push(options.reporter);
        }

        if (options.globals) {
            arrayOfStrings(options.globals, 'options.globals', function(options){
                args.push('--globals');
                args.push(options.join(','));
            });
        }

        if (options.slow) {
            args.push('--slow');
            args.push(options.slow);
        }
        if (options.grep) {
            args.push('--grep');
            args.push(options.grep);
        }

        if (options.recursive) {
            args.push('--recursive');
        }

        var masked = this.filesSrc;

        if (options.mask) {
            masked = masked.map(function (file) {
                return path.join(grunt.file.isDir(file) ? file : path.dirname(file), options.mask);
            });
        }

        if (options.mochaOptions) {
            arrayOfStrings(options.mochaOptions, 'options.mochaOptions', function(options){
                options.forEach(function (opt) {
                    args.push(opt);
                });
            })
        }

        args = args.concat(masked);

        grunt.verbose.ok('Will execute:', options.nodeExec + ' ' + args.join(' '));

        if (!options.dryRun) {
            grunt.util.spawn({
                cmd: options.nodeExec,
                args: args,
                opts: {
                    env: process.env,
                    cwd: options.cwd,
                    stdio: options.quiet ? 'ignore' : 'inherit'
                }
            }, function (err, result) {
                if (err) {
                    grunt.log.error(result);
                    done(false);
                    return;
                }

                executeCheck(function (err, result) {
                    if (!err) {
                        if (options.coverage) {
                            var coverage = grunt.file.read(path.join(coverageFolder, 'lcov.info'));
                            grunt.event.emit('coverage', coverage, function (d) {
                                grunt.log.ok(result || 'Done. Check coverage folder.');
                                done(d);
                            });
                        } else {
                            grunt.log.ok(result || 'Done. Check coverage folder.');
                            done();
                        }
                    } else {
                        done(err);
                    }
                }, coverageFolder, options);
            });
        } else {
            executeCheck(function (err, would) {
                grunt.log.ok('Would execute:', options.nodeExec + ' ' + args.join(' '));
                would && grunt.log.ok(would);
            }, coverageFolder, options);

            done();
        }

    });
};
