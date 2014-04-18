module.exports = function (grunt){
  grunt.initConfig({
    mocha_istanbul: {
      target: {
        src    : 'test',
        options: {
          //coverageFolder: 'lcov',
          coverage     : true,
          noColors     : true,
          dryRun       : false,
          //root: './test',
          //root: './tasks',
          print        : 'detail',
          check        : {
            lines: 1
          },
          excludes: ['test/excluded*.js'],
          mochaOptions: ['--bail','--debug-brk'],
          istanbulOptions: ['--default-excludes'],
          reporter     : 'spec',
          reportFormats: ['lcovonly']
        }
      }
    }
  });

  grunt.event.on('coverage', function (content, done){
    console.log(content.slice(0, 15) + '...');
    done();
  });

  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('default', ['mocha_istanbul']);
};