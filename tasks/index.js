module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  grunt.registerMultiTask('mocha_istanbul', 'Generate coverage report with Istanbul from mocha test', function(){
    if (!this.filesSrc.length || !grunt.file.isDir(this.filesSrc[0])) {
      grunt.fail.fatal('Missing src attribute with the folder with tests');
      return;
    }

    var
      options = this.options({
        require: [],
        ui: false,
        globals: [],
        reporter: false,
        timeout: false,
        coverage: false,
        slow: false,
        grep: false,
        dryRun: false,
        quiet: false
      }),
      done = this.async(),
      cmd = 'node',
      args = [],
      dir = path.join(__dirname, '..'),
      modules = path.join(dir, 'node_modules');

    args.push(path.join(modules, 'istanbul','lib','cli.js'));                       // node ./node_modules/istanbul/lib/cli.js
    args.push('cover');                                                             // node ./node_modules/istanbul/lib/cli.js cover
    args.push(path.join(process.cwd(), 'node_modules', 'mocha', 'bin','_mocha'));   // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha
    args.push('--');                                                                // node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha --

    if (grunt.file.exists(path.join(process.cwd(), this.filesSrc[0], 'mocha.opts'))){
      if (
          options.require.length ||
          options.globals.length ||
          options.ui ||
          options.reporter ||
          options.timeout ||
          options.slow ||
          options.grep
        ) {
        grunt.log.error('Warning: mocha.opts exists, but overwriting with options');
      }
    }

    if (options.timeout) {
      args.push('--timeout');
      args.push(options.timeout);
    }

    if (options.require) {
      options.require.forEach(function(require){
        args.push('--require');
        args.push(require);
      });
    }
    if (options.ui) {
      args.push('--ui');
      args.push(options.ui);
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

    args.push(this.filesSrc[0]);

    grunt.verbose.ok('Will execute: ', 'node ' + args.join(' '));

    if (!options.dryRun) {
      var _mocha = grunt.util.spawn({
        cmd: cmd,
        args: args,
        opts: {
          env: process.env,
          cwd: process.cwd(),
          stdio: options.quiet ? 'ignore' : 'inherit'
        }
      }, function(err, result){
        if (err) {
          grunt.log.error(result);
          done(false);
          return;
        }
        if (options.coverage) {
          var coverage = grunt.file.read(path.join(process.cwd(), 'coverage', 'lcov.info'));
          grunt.event.emit('coverage', coverage);
        }

        grunt.log.ok('Done. Check coverage folder.');
        done();
      });
    } else {
      grunt.log.ok('Would execute: ', 'node ' + args.join(' '));
      done();
    }

  });
};