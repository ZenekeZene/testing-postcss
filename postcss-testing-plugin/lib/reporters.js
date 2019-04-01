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
	
	function _drawTerminalChart(results, options) {
		let chart = new Chart({
			xlabel: 'Selectors',
			ylabel: 'Specificity',
			direction: 'y',
			width: results.rules.length / 10, // TODO: (1)
			height: 10,
			lmargin: 15,
			step: 1,
		});
		console.log(chart.width);
			
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
			if (consoleOption.chart) { _drawTerminalChart(results, consoleOption); }
			
			if (jsonOption) { _writeJSON(results.rules, jsonOption); }
	
			log(notice("-------------\n\n\n"));
			
		}
	};

	return {
		handReporters: handReporters,
	};
}());

module.exports = reporters.handReporters;
// (1) Tiene que ser un promedio con la anchura de la terminal: 
// https://www.google.com/search?ei=8pqiXJ2uH6WPlwTOvrKACQ&q=get+width+of+current+terminal+bash&oq=get+width+of+current+terminal+bash&gs_l=psy-ab.3...11243.12101..12509...0.0..0.99.423.5......0....1..gws-wiz.......33i10.IghVF_SqI8I