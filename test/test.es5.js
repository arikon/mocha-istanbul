var es6 = require('../es6/file.es6');

describe('grunt mocha istanbul es6 with es5 test', function() {
  it('should pass', function(){
    return es6.exec();
  });
});