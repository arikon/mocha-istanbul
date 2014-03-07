module.exports = function(grunt){
  grunt.initConfig({
    mocha_istanbul: {
      target: {
        src: 'test',
        options: {
          coverageFolder: 'lcov',
          coverage: true,
          //dryRun: true,
          check: {
            lines: 20
          },
          reporter: 'spec'
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