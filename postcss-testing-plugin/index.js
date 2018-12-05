'use strict';

const _ = require('lodash');
const postcss = require('postcss');
const specificity = require('specificity');
const Chart = require('cli-chart');
const fs = require('fs');
const clc = require("cli-color");

var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue;

const process = function (root, options) {
    let results = {
        maxSelectors: 0,
        specificities: [],
        specificitesPoints: [],
        _totalSpecificity: 0,
        rules: []
    };
    // Transform CSS AST here
    let i = 0;
    root.walkRules(rule => {
        const selectors = rule.selectors;
        //console.log(rule);
        let item = {
            'source': rule.source.start,
            'selectors': selectors,
            'file': rule.source.file
        };

        rule.selectors.forEach(selector => {
            let specifyRAW = specificity.calculate(selector);
            let specifyInt = parseInt(specifyRAW[0].specificity.replace(/,/g, ''));
            results._totalSpecificity += specifyInt;
            results.specificities.push(specifyInt);
            results.specificitesPoints.push({ x: i, y: specifyInt });
            item.specificity = specifyRAW[0].specificity;
            item.specificityComputed = specifyInt;
        });
        
        results.rules.push(item);
        i++;
    });
    
    if (options.reporters) {
        let consoleItem = options.reporters.filter(function(e) {
            return (e.formatter === 'console' ? e : null);
        })[0];

        let jsonItem = options.reporters.filter(function(e) {
            return (e.formatter === 'json' ? e : null);
        })[0];
        
        if (consoleItem) {
            results.maxSelectors = results.specificities.length;
            results.averageSpecificity = results._totalSpecificity / results.maxSelectors;
            console.log(notice("-------------\n\n"));
            console.log(notice("\nSelectors: " + results.maxSelectors));
            console.log(notice("Average Specificity: " + results.averageSpecificity.toFixed(0)));
            console.log(notice("-------------\n\n"));
        }
            // More stats
        if (consoleItem.chart) 
            drawChart(results, consoleItem);
        if (jsonItem)
            fs.writeFileSync(jsonItem.save, 'data = ' + JSON.stringify({'items': results.rules }));

        console.log("-------------\n\n");
        
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
    
    let warningSelectors = [];
    for(let i = 0; i < results.rules.length; i++) {
        let rule = results.rules[i];
        if (rule.specificityComputed > options.maxSpecificity) {
            chart.addBar(rule.specificityComputed, 'red');
            warningSelectors.push(rule);
        } else {
            chart.addBar(results.specificities[i], 'green');
        }
    }
    chart.draw();
    console.log(notice(warningSelectors.length + ' selectors with high specificity ( > ' + options.maxSpecificity + ')'));
    console.log('\n');
    warningSelectors.forEach( warningItem => {
        let output = '';
        output += '[' + warningItem.source.line + ':' + warningItem.source.column + '] ';
        warningItem.selectors.forEach( selector => {
            output += selector;
        });
        output += ' [' + warningItem.specificity + ' => ' + warningItem.specificityComputed + ']';
        console.log(error(output));
    });
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
