module.exports = (imports, innerFunctionName) => {
  const scope = {};
  const sideEffects = [];

  imports.forEach(imp => {
    if (typeof imp === 'string') {
      sideEffects.push(`${innerFunctionName}('${imp}')`);
    } else if (imp.source) {
      const path = imp.imported.map(part => `.${part}`).join('');
      scope[imp.local] = `${innerFunctionName}('${imp.source}')${path}`;
    }
  });

  return { scope, sideEffects };
};
