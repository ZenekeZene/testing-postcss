'use strict';

const _ = require('lodash');
const postcss = require('postcss');
const specificity = require('specificity');
const Chart = require('cli-chart');
const fs = require('fs');

const process = function (root, options) {
    let results = [];
    // Transform CSS AST here
    root.walkRules(rule => {
        const selectors = rule.selectors;
        selectors.forEach(selector => {
            let specifyRAW = specificity.calculate(selector);
            let specifyInt = parseInt(specifyRAW[0].specificity.replace(/,/g, ''));
            results.push(specifyInt);
        });
    });
    
    if (options.reporters) {
        let consoleItem = options.reporters.filter(function(e) {
            return (e.formatter === 'console' ? e : null);
        })[0];

        let jsonItem = options.reporters.filter(function(e) {
            return (e.formatter === 'json' ? e : null);
        })[0];
        
        if (consoleItem)
            // More stats
        if (consoleItem.chart)
            drawChart(results, consoleItem);
        if (jsonItem)
            fs.writeFileSync(jsonItem.save, JSON.stringify({'specificities': results }));
    }
    return results;
};

const drawChart = function(results, options) {
    let chart = new Chart({
        xlabel: 'Selectors',
        ylabel: 'Specificity',
        direction: 'y',
        width: results.length,
        height: 10,
        lmargin: 15,
        step: 1
    });
    for(let i = 0; i < results.length; i++) {
        if (results[i] > options.maxSpecificity)
            chart.addBar(results[i], 'red');
        else {
            chart.addBar(results[i], 'green');
        }
    }
    chart.draw();
}

module.exports = postcss.plugin('postcss-testing-plugin', function (options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    } else {
        options = options || {};
        callback = callback || _.noop;
    }
    
    return function (root, result) {
        callback(process(root, options));
    };
});
