module.exports = function (grunt){
  'use strict';

  var
    cmd = process.execPath,
    path = require('path');

  function getMochaPath() {
    try {
      return require.resolve('mocha/bin/_mocha');
    } catch (ignored) {
      grunt.fail.warn('Mocha peer dependency missing.  Please "npm install mocha"');
    }
  }

  function getIstanbulPath() {
    try {
      return require.resolve('istanbul/lib/cli');
    } catch (ignored) {
      grunt.fail.warn('Istanbul peer dependency missing.  Please "npm install istanbul"');
    }
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

      grunt.verbose.ok('Will execute: ', 'node ' + args.join(' '));

      if (!options.dryRun) {
        grunt.util.spawn({
          cmd : cmd,
          args: args,
          opts: {
            env  : process.env,
            cwd  : process.cwd(),
            stdio: options.quiet ? 'ignore' : 'inherit'
          }
        }, function (err){
          if (err) {
            callback && callback(err);
            return;
          }
          callback && callback(null, 'Done. Minimum coverage threshold succeeded.');
        });

        return;
      } else {
        callback && callback(null, 'Would also execute post cover: node ' + args.join(' '));
        return;
      }
    }

    callback && callback();
  }

  grunt.registerMultiTask('istanbul_check_coverage', 'Solo task for checking coverage over different or many files.', function () {
    var
      done = this.async(),
      options = this.options({
        coverageFolder: 'coverage',
        check: {
          statements: false,
          lines: false,
          functions: false,
          branches: false
        }
      });

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

  grunt.registerMultiTask('mocha_istanbul', 'Generate coverage report with Istanbul from mocha test', function (){
    if (!this.filesSrc.length) {
      grunt.log.error('No test files to run');
      return;
    }

    var
      mochaPath = getMochaPath(),
      options = this.options({
        require        : [],
        ui             : false,
        globals        : [],
        reporter       : false,
        timeout        : false,
        coverage       : false,
        slow           : false,
        grep           : false,
        dryRun         : false,
        quiet          : false,
        recursive      : false,
        mask           : false,
        root           : false,
        print          : false,
        noColors       : false,
        harmony        : false,
        coverageFolder : 'coverage',
        reportFormats  : ['lcov'],
        check          : {
          statements: false,
          lines     : false,
          functions : false,
          branches  : false
        },
        excludes       : false,
        mochaOptions   : false,
        istanbulOptions: false
      }),
      filesDir = grunt.file.isDir(this.filesSrc[0]) ? this.filesSrc[0] : path.dirname(this.filesSrc[0]),
      coverageFolder = path.join(process.cwd(), options.coverageFolder),
      rootFolderForCoverage = options.root ? path.join(process.cwd(), options.root) : '.',
      done = this.async(),
      args = [];

    if (!options.scriptPath) {
      options.scriptPath = getIstanbulPath();
    }

    if (options.harmony) {
      args.push('--harmony');
    }

    args.push(options.scriptPath);              // ie. node ./node_modules/istanbul/lib/cli.js or another script name
    args.push('cover');                   // node <scriptPath> cover

    if (typeof options.require === 'string') {
      options.require = [options.require];
    }


    if (options.excludes && options.excludes.length) {
      options.excludes.forEach(function(excluded){
        args.push('-x');
        args.push(excluded);
      });
    }

    args.push('--dir=' + coverageFolder); // node ./node_modules/istanbul/cli.js --dir=coverage
    if (options.root) {
      args.push('--root=' + rootFolderForCoverage);
    }
    if (options.print) {
      args.push('--print=' + options.print);
    }

    options.reportFormats.forEach(function (format){
      args.push('--report=' + format);
    });

    if (options.istanbulOptions && options.istanbulOptions.length) {
      options.istanbulOptions.forEach(function (opt){
        args.push(opt);
      });
    }

    args.push(mochaPath);                 // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha
    args.push('--');                      // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha --

    if (grunt.file.exists(path.join(process.cwd(), filesDir, 'mocha.opts'))) {
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
        grunt.log.error('Warning: mocha.opts exists, but overwriting with options');
      }
    }

    if (options.timeout) {
      args.push('--timeout');
      args.push(options.timeout);
    }

    if (options.require) {
      options.require.forEach(function (require){
        args.push('--require');
        args.push(require);
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

    if (options.globals.length) {
      args.push('--globals');
      args.push(options.globals.join(','));
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

    if (options.mochaOptions && options.mochaOptions.length) {
      options.mochaOptions.forEach(function (opt){
        args.push(opt);
      });
    }

    args = args.concat(masked);

    grunt.verbose.ok('Will execute:', 'node ' + args.join(' '));

    if (!options.dryRun) {
      grunt.util.spawn({
        cmd : cmd,
        args: args,
        opts: {
          env  : process.env,
          cwd  : process.cwd(),
          stdio: options.quiet ? 'ignore' : 'inherit'
        }
      }, function (err, result){
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
        grunt.log.ok('Would execute:', 'node ' + args.join(' '));
        would && grunt.log.ok(would);
      }, coverageFolder, options);

      done();
    }

  });
};
