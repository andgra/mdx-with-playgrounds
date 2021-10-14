const generateRequires = require('../lib/utils/generate-requires');

describe('generateRequires util', () => {
  it(`should generate side effects`, () => {
    const { sideEffects } = generateRequires(['foo', 'bar'], 'requireTest');
    expect(sideEffects).toEqual([`requireTest('foo')`, `requireTest('bar')`]);
  });

  it(`should generate scope`, () => {
    const { scope } = generateRequires(
      [
        { imported: ['default'], local: 'foo', source: 'foo' },
        { imported: [], local: 'bar', source: 'bar' }
      ],
      'requireTest'
    );
    expect(scope).toEqual({
      foo: `requireTest('foo').default`,
      bar: `requireTest('bar')`
    });
  });

  it(`should generate side effects and scope`, () => {
    const { scope, sideEffects } = generateRequires(
      [
        'foo',
        { imported: ['default'], local: 'foo', source: 'foo' },
        'bar',
        { imported: [], local: 'bar', source: 'bar' }
      ],
      'requireTest'
    );
    expect(sideEffects).toEqual([`requireTest('foo')`, `requireTest('bar')`]);
    expect(scope).toEqual({
      foo: `requireTest('foo').default`,
      bar: `requireTest('bar')`
    });
  });

  it(`should proceed "innerFunctionName" argument`, () => {
    const randomFuncName = Math.random().toString(36).substring(7);
    const { scope, sideEffects } = generateRequires(
      [{ imported: ['default'], local: 'foo', source: 'foo' }, 'bar'],
      randomFuncName
    );
    expect(sideEffects).toEqual([`${randomFuncName}('bar')`]);
    expect(scope).toEqual({ foo: `${randomFuncName}('foo').default` });
  });

  it(`should generate scope with complex path`, () => {
    const { scope } = generateRequires(
      [{ imported: ['foo', 'bar', 'baz'], local: 'foo', source: 'foo' }],
      'requireTest'
    );
    expect(scope).toEqual({
      foo: `requireTest('foo').foo.bar.baz`
    });
  });

  it(`should generate scope with different names`, () => {
    const { scope } = generateRequires(
      [{ imported: ['foo'], local: 'bar', source: 'baz' }],
      'requireTest'
    );
    expect(scope).toEqual({
      bar: `requireTest('baz').foo`
    });
  });
});
