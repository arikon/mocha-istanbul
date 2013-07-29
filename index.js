var ISTANBUL = require('istanbul'),
    fs = require('fs'),
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

    runner.on('end', function () {

        var reporters,
            coverage;
        if (process.env.ISTANBUL_REPORTERS) {
            reporters = process.env.ISTANBUL_REPORTERS.split(',');
        } else {
            reporters = ['text-summary', 'html'];
        }
        if (process.env.ISTANBUL_COVERAGE) {
            coverage = process.env.ISTANBUL_COVERAGE;
        } else {
            coverage = 'coverage.json';
        }

        var cov = global.__coverage__ || {},
            collector = new Collector();


        collector.add(cov);
        //Write coverage.json
        fs.writeFileSync(coverage, JSON.stringify(cov), 'utf8');

        reporters.forEach(function (reporter) {
            Report.create(reporter).writeReport(collector, true);
        });

    });

}
