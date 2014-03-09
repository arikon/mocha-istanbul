module.exports = function(grunt){
  grunt.initConfig({
    mocha_istanbul: {
      target: {
        src: 'test',
        options: {
          //coverageFolder: 'lcov',
          coverage: true,
          //dryRun: true,
          //root: './test',
          root: './tasks',
          check: {
            lines: 1
          },
          reporter: 'spec',
          reportFormats: ['cobertura','lcovonly']
        }
      }
    }
  });

  grunt.event.on('coverage', function(content, done){
    console.log(content.slice(0, 15) + '...');
    done();
  });

  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('default', ['mocha_istanbul']);
};