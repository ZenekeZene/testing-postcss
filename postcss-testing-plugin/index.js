'use strict';

var postcss = require('postcss');
var specificity = require('specificity');

var process = function (root) {
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
    return results;
};

module.exports = postcss.plugin('postcss-testing-plugin', function (opts, callback) {
    opts = opts || {};

    // Work with options here

    return function (root, result) {
        callback(process(root));
    };
});
