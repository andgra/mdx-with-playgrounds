const visit = require('unist-util-visit');

const extractImports = require('./utils/extract-imports');
const generateRequires = require('./utils/generate-requires');
const updateNode = require('./utils/update-node');
const { INNER_FUNCTION_NAME } = require('./utils/variables');

function playgrounds() {
  return function transformer(tree) {
    visit(tree, 'code', node => {
      if (!node.lang || !node.lang.match(/^jsx?$/i)) {
        return;
      }
      const { code, imports, importsRaw } = extractImports(node.value);
      const { scope, sideEffects } = generateRequires(
        imports,
        INNER_FUNCTION_NAME
      );

      updateNode(node, { code, scope, sideEffects, importsRaw });
    });
  };
}

module.exports = playgrounds;
