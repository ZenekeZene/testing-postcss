'use strict';

const _ = require('lodash');
const postcss = require('postcss');
const specificity = require('specificity');

const handReporters = require('./lib/reporters');

const process = function (root, options) {
	let results = {
		maxSelectors: 0,
		specificities: [],
		specificitiesPoints: [],
		_totalSpecificity: 0,
		rules: [],
	};
	
	let i = 0;
	root.walkRules(rule => {
		const selectors = rule.selectors;
		
		let item = {
			source: rule.source.start,
			selectors: selectors,
			file: rule.source.file,
			specificitiesPoints: [],
		};

		rule.selectors.forEach(selector => {
			let specifyRAW = specificity.calculate(selector);
			let specifyInt = parseInt(specifyRAW[0].specificity.replace(/,/g, ''));

			results._totalSpecificity += specifyInt;
			results.specificities.push(specifyInt);
			results.specificitiesPoints.push({ x: i, y: specifyInt, label: selector });

			item.specificity = specifyRAW[0].specificity;
			item.specificityComputed = specifyInt;
			item.specificitiesPoints.push({ x: i, y: specifyInt, label: selector });
		});
		
		results.rules.push(item);
		i++;
	});

	handReporters(options, results);

	return results;
};

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
