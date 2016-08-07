module.exports = function (grunt) {
    var nodeExec = require.resolve('.bin/babel-node' + (process.platform === 'win32' ? '.cmd' : ''));

    grunt.initConfig({
        mocha_istanbul: {
            target: {
                src: 'test/*.test.js',
                options: {
                    //coverageFolder: 'lcov',
                    coverage: true,
                    noColors: true,
                    dryRun: false,
                    //root: './test',
                    //root: './tasks',
                    //print: 'detail',
                    check: {
                        lines: 1
                    },
                    require: ['test/*1.js'],
                    excludes: ['test/excluded*.js', '**/other.js'],
                    mochaOptions: ['--bail', '--debug-brk'],
                    reporter: 'spec',
                    reportFormats: ['html','lcovonly']
                }
            },
            babel: {
                src: 'test/*.es6.js',
                options: {
                    nodeExec: nodeExec,
                    reportFormats: ['html'],
                    istanbulOptions: ['--verbose'],
                    root: 'es6',
                    mochaOptions: ['--compilers', 'js:babel-register']
                }
            },
            isparta: {
                src: 'test/*.es5.js',
                options: {
                    nodeExec: nodeExec,
                    reportFormats: ['html'],
                    istanbulOptions: ['--verbose'],
                    root: 'es6',
                    scriptPath: require.resolve('isparta/lib/cli')
                }
            }
        }
    });

    grunt.event.on('coverage', function (content, done) {
        console.log(content.slice(0, 15) + '...');
        done();
    });

    require('./tasks')(grunt);

    grunt.registerTask('default', ['mocha_istanbul']);
};
