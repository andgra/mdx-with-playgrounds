const { INNER_FUNCTION_NAME } = require('./utils/variables');

const INNER_REQUIRE_REGEXP = new RegExp(
  `[\`'"]${INNER_FUNCTION_NAME}\\([\`'"]([^\`'"]+)[\`'"]\\)([^\`'"]*)[\`'"]`,
  'g'
);

/**
 * Replaces all the occurrences of "__requireToRun('foo')" (string) with require("foo") (callExpression)
 * For example:
 *
 * "scope": { "Button": "__requireToRun('@rescui/button').default" },
 * "sideEffects": ["__requireToRun('@rescui/typography')"],
 *
 * Converts to:
 *
 * "scope": { "Button": require("@rescui/button").default },
 * "sideEffects": [require("@rescui/typography")],
 *
 * @param src
 * @returns {string}
 */
module.exports = src => src.replace(INNER_REQUIRE_REGEXP, 'require("$1")$2');
