var postcss = require('postcss');

module.exports = postcss.plugin('postcss-testing-plugin', function (opts) {
    opts = opts || {};

    // Work with options here

    return function (root, result) {
        // Transform CSS AST here
        root.walkComments(comment => {
            if (comment.text.toLowerCase().indexOf('jorge') === 0) {
                comment.after(postcss.comment({text: 'Deuda tecnica'}));
                comment.remove();
            }
        });
    };
});
