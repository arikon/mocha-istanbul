var ISTANBUL = require('istanbul'),

    Report = ISTANBUL.Report,
    Collector = ISTANBUL.Collector;

/**
 * Expose `Istanbul`.
 */
exports = module.exports = Istanbul;

/**
 * Initialize a new Istanbul reporter.
 *
 * @param {Runner} runner
 * @public
 */
function Istanbul(runner) {

    runner.on('end', function(){

        var cov = global.__coverage__ || {},
            collector = new Collector();

        collector.add(cov);

        ['text-summary', 'html'].forEach(function(reporter) {
            Report.create(reporter).writeReport(collector, true);
        });

    });

}
