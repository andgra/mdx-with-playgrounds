/* eslint-disable no-loop-func,complexity */
const traverse = require('@babel/traverse').default;
const { parse } = require('@babel/parser');

const removeStatement = (path, sourceObj) => {
  let nodeToRemove = path.node;
  let parentPath = path.parentPath;
  while (parentPath) {
    const parent = parentPath.node;
    // pass variable declaration - we need to remove it together
    if (
      parent.type !== 'VariableDeclaration' &&
      parent.type !== 'VariableDeclarator' &&
      parent.type !== 'ExpressionStatement' &&
      parent.type !== 'MemberExpression'
    ) {
      // we need to cut from the source code statement part
      // after this, we join before statement part and after statement part
      const removeLength = nodeToRemove.end - nodeToRemove.start;
      const part1 = sourceObj.code.slice(
        0,
        nodeToRemove.start - sourceObj.offset
      );
      const part2 = sourceObj.code.slice(nodeToRemove.end - sourceObj.offset);
      const statementRaw = sourceObj.code.slice(
        nodeToRemove.start - sourceObj.offset,
        nodeToRemove.end - sourceObj.offset
      );
      sourceObj.code = part1 + part2;
      sourceObj.offset += removeLength;
      sourceObj.statementsRaw.push(statementRaw);
      break;
    }
    nodeToRemove = parent;
    parentPath = parentPath.parentPath;
  }
};

function parseProperties(properties, { imports, imported, source }) {
  properties.forEach(property => {
    if (property.key && property.value) {
      if (
        property.value.type === 'ObjectPattern' &&
        property.value.properties &&
        property.value.properties.length
      ) {
        // const { bar: { boo: baz } } = require('foo')
        parseProperties(property.value.properties, {
          imports,
          imported: [...imported, property.key.name],
          source
        });
      } else {
        // const { bar } = require('foo')
        imports.push({
          imported: [...imported, property.key.name],
          local: property.value.name,
          source
        });
      }
    }
  });
}

module.exports = function extractImports(code) {
  const ast = parse(code, { plugins: ['jsx'], sourceType: 'unambiguous' });
  if (!ast) {
    return { code, imports: [], importsRaw: '' };
  }

  const imports = [];
  const sourceObj = {
    code,
    offset: 0,
    statementsRaw: []
  };

  /**
   * WARNING: inline requires (in jsx / function calls / etc) are NOT supported.
   * Separate imports/required from the code.
   */
  traverse(ast, {
    // import { foo } from 'foo'
    // import { foo as bar } from 'foo'
    // import * as foo from 'foo'
    // import foo from 'foo'
    // import 'foo'
    ImportDeclaration(path) {
      const node = path.node;
      if (node.source) {
        const source = node.source.value;
        if (node.specifiers && node.specifiers.length) {
          node.specifiers.forEach(specifier => {
            const local = specifier.local ? specifier.local.name : '';
            // eslint-disable-next-line default-case
            switch (specifier.type) {
              case 'ImportDefaultSpecifier':
                // import foo from 'foo'
                imports.push({ imported: ['default'], local, source });
                break;
              case 'ImportNamespaceSpecifier':
                // import * as foo from 'foo'
                imports.push({ imported: [], local, source });
                break;
              case 'ImportSpecifier':
                // import { foo as bar } from 'foo'
                // import { foo } from 'foo'
                imports.push({
                  imported: [specifier.imported.name],
                  local,
                  source
                });
                break;
            }
          });
        } else {
          // import 'foo';
          imports.push(source);
        }
        removeStatement(path, sourceObj);
      }
    },

    // const bar = require('foo')
    // const bar = require('foo').bar
    // const { foo } = require('foo')
    // const { bar } = require('foo').foo
    // const { bar: baz } = require('foo')
    // const { bar: { boo: baz } } = require('foo')
    // require('foo')
    CallExpression(path) {
      const node = path.node;
      if (
        node.callee &&
        // ignore callee "import" for now
        // do it when the necessary comes
        node.callee.name === 'require' &&
        node.arguments &&
        node.arguments[0].value
      ) {
        const source = node.arguments[0].value;
        let foundVar = false;
        const imported = [];
        let currentPath = path;
        while ((currentPath = currentPath.parentPath)) {
          const current = currentPath.node;
          if (current.type === 'MemberExpression' && current.property) {
            // const foo = require('foo').foo
            imported.push(current.property.name);
          }
          if (current.type === 'VariableDeclarator' && current.id) {
            if (
              current.id.type === 'ObjectPattern' &&
              current.id.properties &&
              current.id.properties.length
            ) {
              // const { foo } = require('foo')
              // const { foo, bar: baz } = require('foo')
              parseProperties(current.id.properties, {
                imports,
                imported,
                source
              });
            } else {
              // const foo = require('foo')
              imports.push({
                imported,
                local: current.id.name,
                source
              });
            }
            foundVar = true;
            break;
          }
        }
        if (!foundVar) {
          // require('foo')
          imports.push(source);
        }
        removeStatement(path, sourceObj);
      }
    }
  });

  return {
    code: sourceObj.code.trimStart(),
    imports,
    importsRaw: sourceObj.statementsRaw
  };
};
