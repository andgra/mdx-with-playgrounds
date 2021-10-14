function updateNode(node, { code, scope, sideEffects, importsRaw }) {
  node.value = code;
  // `node.data.hProperties` object forwards props to the MDXLayout component
  // so after mdx-js loader these props will be passed to the `code` blocks
  node.data = node.data || {};
  node.data.hProperties = node.data.hProperties || {};
  node.data.hProperties.language = node.lang;
  node.data.hProperties.scope = scope;
  // sideEffects don't need to be processed by any code after the loaders because
  // they will be converted to the unnamed requires, which will be loaded to the
  // whole page as long as they are present in the resulted JSX
  node.data.hProperties.sideEffects = sideEffects;
  node.data.hProperties.importsRaw = importsRaw;
}

module.exports = updateNode;
