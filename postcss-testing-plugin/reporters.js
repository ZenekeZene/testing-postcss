const Chart = require('cli-chart');
const fs = require('fs');
const clc = require("cli-color");

const error = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;
const log = console.log;

const reporters = (function() {
	'use strict';

	function _drawLogs (results) {
		results.maxSelectors = results.specificities.length;
		results.averageSpecificity = results._totalSpecificity / results.maxSelectors;
		log(notice("-------------\n\n\n"));
		log(notice("Selectors: " + results.maxSelectors));
		log(notice("Average Specificity: " + results.averageSpecificity.toFixed(0)));
		log(notice("-------------\n\n"));
	};
	
	function _drawChart(results, options) {
		let chart = new Chart({
			xlabel: 'Selectors',
			ylabel: 'Specificity',
			direction: 'y',
			width: results.length,
			height: 10,
			lmargin: 15,
			step: 1,
		});
			
		let warningSelectors = [];
		let i, rule;
		for(i = 0; i < results.rules.length -1; i++) {
			rule = results.rules[i];
			if (rule.specificityComputed > options.maxSpecificity) {
				chart.addBar(rule.specificityComputed, 'red');
				warningSelectors.push(rule);
			} else {
				chart.addBar(results.specificities[i], 'green');
			}
		}
		chart.draw();
		
		log(notice(`${warningSelectors.length} selectors with high specificity ( > ${options.maxSpecificity})\n`));
	
		warningSelectors.forEach( warningItem => {
			let output = '';
			output += `[${warningItem.source.line} : ${warningItem.source.column}]`;
			warningItem.selectors.forEach( selector => {
				output += selector;
			});
			output += `[${warningItem.specificity} => ${warningItem.specificityComputed}]`;
		});
	};
	
	function _writeJSON (rules, jsonOption) {
		fs.writeFileSync(jsonOption.save, 'data = ' + JSON.stringify({'items': rules }));
	};
 
	function handReporters (options, results) {
		if (options.reporters) {
			let consoleOption = options.reporters.filter((e) => 
				(e.formatter === 'console' ? e : null)
			)[0];
	
			let jsonOption = options.reporters.filter((e) => 
				(e.formatter === 'json' ? e : null)
			)[0];
			
			if (consoleOption) { _drawLogs(results); }
				// More stats
			if (consoleOption.chart) { _drawChart(results, consoleOption); }
			
			if (jsonOption) { _writeJSON(results.rules, jsonOption); }
	
			log(notice("-------------\n\n\n"));
			
		}
	};

	return {
		handReporters: handReporters,
	};
}());

module.exports = reporters.handReporters;