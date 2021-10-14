const extractImports = require('../lib/utils/extract-imports');

describe('extractImports util', () => {
  describe('imports', () => {
    it(`should parse "import foo from 'foo'" statements`, () => {
      const { imports } = extractImports("import foo from 'foo'");
      expect(imports).toEqual([
        { imported: ['default'], local: 'foo', source: 'foo' }
      ]);
    });

    it(`should parse "import * as foo from 'foo'" statements`, () => {
      const { imports } = extractImports("import * as foo from 'foo'");
      expect(imports).toEqual([{ imported: [], local: 'foo', source: 'foo' }]);
    });

    it(`should parse "import { foo } from 'foo'" statements`, () => {
      const { imports } = extractImports("import { foo } from 'foo'");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'foo', source: 'foo' }
      ]);
    });

    it(`should parse "import { foo, bar } from 'foo'" statements`, () => {
      const { imports } = extractImports("import { foo, bar } from 'foo'");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'foo', source: 'foo' },
        { imported: ['bar'], local: 'bar', source: 'foo' }
      ]);
    });

    it(`should parse "import { bar as baz } from 'foo'" statements`, () => {
      const { imports } = extractImports("import { bar as baz } from 'foo'");
      expect(imports).toEqual([
        { imported: ['bar'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "import 'foo'" statements`, () => {
      const { imports } = extractImports("import 'foo'");
      expect(imports).toEqual(['foo']);
    });

    it(`should parse "const foo = require('foo')" statements`, () => {
      const { imports } = extractImports("const foo = require('foo')");
      expect(imports).toEqual([{ imported: [], local: 'foo', source: 'foo' }]);
    });

    it(`should parse "const foo = require('foo').default" statements`, () => {
      const { imports } = extractImports("const foo = require('foo').default");
      expect(imports).toEqual([
        { imported: ['default'], local: 'foo', source: 'foo' }
      ]);
    });

    it(`should parse "const foo = require('foo').foo" statements`, () => {
      const { imports } = extractImports("const foo = require('foo').foo");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'foo', source: 'foo' }
      ]);
    });

    it(`should parse "const bar = require('foo').foo" statements`, () => {
      const { imports } = extractImports("const bar = require('foo').foo");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'bar', source: 'foo' }
      ]);
    });

    it(`should parse "const bar = require('foo').foo.bar" statements`, () => {
      const { imports } = extractImports("const bar = require('foo').foo.bar");
      expect(imports).toEqual([
        { imported: ['foo', 'bar'], local: 'bar', source: 'foo' }
      ]);
    });

    it(`should parse "const { baz } = require('foo').foo.bar" statements`, () => {
      const { imports } = extractImports(
        "const { baz } = require('foo').foo.bar"
      );
      expect(imports).toEqual([
        { imported: ['foo', 'bar', 'baz'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "const { foo } = require('foo')" statements`, () => {
      const { imports } = extractImports("const { foo } = require('foo')");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'foo', source: 'foo' }
      ]);
    });

    it(`should parse "const { foo, bar } = require('foo')" statements`, () => {
      const { imports } = extractImports("const { foo, bar } = require('foo')");
      expect(imports).toEqual([
        { imported: ['foo'], local: 'foo', source: 'foo' },
        { imported: ['bar'], local: 'bar', source: 'foo' }
      ]);
    });

    it(`should parse "const { bar: baz } = require('foo')" statements`, () => {
      const { imports } = extractImports("const { bar: baz } = require('foo')");
      expect(imports).toEqual([
        { imported: ['bar'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "const { bar: baz } = require('foo').foo" statements`, () => {
      const { imports } = extractImports(
        "const { bar: baz } = require('foo').foo"
      );
      expect(imports).toEqual([
        { imported: ['foo', 'bar'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "const { bar: { boo: baz } } = require('foo').foo" statements`, () => {
      const { imports } = extractImports(
        "const { bar: { boo: baz } } = require('foo').foo"
      );
      expect(imports).toEqual([
        { imported: ['foo', 'bar', 'boo'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "const { boo, bar: baz } = require('foo').foo" statements`, () => {
      const { imports } = extractImports(
        "const { boo, bar: baz } = require('foo').foo"
      );
      expect(imports).toEqual([
        { imported: ['foo', 'boo'], local: 'boo', source: 'foo' },
        { imported: ['foo', 'bar'], local: 'baz', source: 'foo' }
      ]);
    });

    it(`should parse "require('foo').default" statements`, () => {
      const { imports } = extractImports("require('foo').default");
      expect(imports).toEqual(['foo']);
    });

    it(`should parse "require('foo').bar" statements`, () => {
      const { imports } = extractImports("require('foo').bar");
      expect(imports).toEqual(['foo']);
    });

    it(`should parse "require('foo')" statements`, () => {
      const { imports } = extractImports("require('foo')");
      expect(imports).toEqual(['foo']);
    });
  });
  describe('code', () => {
    it(`should cut default "import" statements`, () => {
      const source = "import Foo from 'foo';\n<Foo />";
      const { code } = extractImports(source);
      expect(code).toEqual('<Foo />');
    });

    it(`should cut partial "import" statements`, () => {
      const source = "import { Foo, Bar } from 'foo';\n<Foo><Bar/></Foo>";
      const { code } = extractImports(source);
      expect(code).toEqual('<Foo><Bar/></Foo>');
    });

    it(`should cut "import"-effect statements`, () => {
      const source = "import 'foo';\n<div />";
      const { code } = extractImports(source);
      expect(code).toEqual('<div />');
    });

    it(`should cut default "require" statements`, () => {
      const source = "const Foo = require('foo');\n<Foo />";
      const { code } = extractImports(source);
      expect(code).toEqual('<Foo />');
    });

    it(`should cut maximum depth "require" statements`, () => {
      const source =
        "function abc() { const { Foo } = require('foo').foo.bar; }\n<Foo />";
      const { code } = extractImports(source);
      expect(code).toEqual('function abc() {  }\n<Foo />');
    });

    it(`should cut partial "require" statements`, () => {
      const source = "const { Foo, Bar } = require('foo');\n<Foo><Bar /></Foo>";
      const { code } = extractImports(source);
      expect(code).toEqual('<Foo><Bar /></Foo>');
    });

    it(`should cut "require"-effect statements`, () => {
      const source = "require('foo');\n<div/>";
      const { code } = extractImports(source);
      expect(code).toEqual('<div/>');
    });
  });

  describe('importsRaw', () => {
    it(`should extract raw "import" statements`, () => {
      const source =
        "import Foo from 'foo';\nimport {bar} from 'bar';\n<Foo />";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual([
        "import Foo from 'foo';",
        "import {bar} from 'bar';"
      ]);
    });

    it(`should extract partial "import" statements`, () => {
      const source = "import { Foo, Bar } from 'foo';\n<Foo><Bar/></Foo>";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["import { Foo, Bar } from 'foo';"]);
    });

    it(`should extract "import"-effect statements`, () => {
      const source = "import 'foo';\nimport 'bar';\n<div />";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["import 'foo';", "import 'bar';"]);
    });

    it(`should extract raw "require" statements`, () => {
      const source =
        "const Foo = require('foo');\nconst {bar} = require('foo').foo;const a = 1;require('b');<Foo />";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual([
        "const Foo = require('foo');",
        "const {bar} = require('foo').foo;",
        "require('b');"
      ]);
    });

    it(`should extract default "require" statements`, () => {
      const source = "const Foo = require('foo');\n<Foo />";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["const Foo = require('foo');"]);
    });

    it(`should extract maximum depth "require" statements`, () => {
      const source =
        "function abc() { const { Foo } = require('foo').foo.bar; }\n<Foo />";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["const { Foo } = require('foo').foo.bar;"]);
    });

    it(`should extract partial "require" statements`, () => {
      const source = "const { Foo, Bar } = require('foo');\n<Foo><Bar /></Foo>";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["const { Foo, Bar } = require('foo');"]);
    });

    it(`should extract "require"-effect statements`, () => {
      const source = "require('foo');\n<div/>";

      const { importsRaw } = extractImports(source);
      expect(importsRaw).toEqual(["require('foo');"]);
    });
  });

  describe('lifelike case', () => {
    it(`should parse complex example`, () => {
      const source = `import '@rescui/typography';
import { useState, cloneElement } from 'react'
import { ChipList, Chip } from '@rescui/tab-list';

const [activeIndex, setActiveIndex] = useState(0);

const CSSContentSwitcher = ({ index, children }) => {
  return children.map((ch, i) => {
    const chStyles = ch.props.style || {};
    const addStyles = i === index ? {} : { display: 'none' };
    return cloneElement(ch, { key: i, style: { ...chStyles, ...addStyles } });
  });
};

<div className='rs-docs-offset-top-24'>
  <ChipList value={activeIndex} onChange={v => setActiveIndex(v)}>
    <Chip>First</Chip>
    <Chip>Second</Chip>
    <Chip>Third</Chip>
  </ChipList>
  <CSSContentSwitcher index={activeIndex}>
    <div>First</div>
    <div>Second</div>
    <div>Third</div>
  </CSSContentSwitcher>
</div>;`;
      const { code, imports, importsRaw } = extractImports(source);

      expect(imports).toEqual([
        '@rescui/typography',
        { imported: ['useState'], local: 'useState', source: 'react' },
        { imported: ['cloneElement'], local: 'cloneElement', source: 'react' },
        {
          imported: ['ChipList'],
          local: 'ChipList',
          source: '@rescui/tab-list'
        },
        { imported: ['Chip'], local: 'Chip', source: '@rescui/tab-list' }
      ]);

      expect(importsRaw).toEqual([
        "import '@rescui/typography';",
        "import { useState, cloneElement } from 'react'",
        "import { ChipList, Chip } from '@rescui/tab-list';"
      ]);

      expect(code).toEqual(`const [activeIndex, setActiveIndex] = useState(0);

const CSSContentSwitcher = ({ index, children }) => {
  return children.map((ch, i) => {
    const chStyles = ch.props.style || {};
    const addStyles = i === index ? {} : { display: 'none' };
    return cloneElement(ch, { key: i, style: { ...chStyles, ...addStyles } });
  });
};

<div className='rs-docs-offset-top-24'>
  <ChipList value={activeIndex} onChange={v => setActiveIndex(v)}>
    <Chip>First</Chip>
    <Chip>Second</Chip>
    <Chip>Third</Chip>
  </ChipList>
  <CSSContentSwitcher index={activeIndex}>
    <div>First</div>
    <div>Second</div>
    <div>Third</div>
  </CSSContentSwitcher>
</div>;`);
    });

    it(`should parse another complex example`, () => {
      const source = `import '@rescui/typography';
import Button from '@rescui/button';
import x from './x';

const a = 1;
const b = require('./b');
const Wrapper = ({ children }) => (
  <div
    style={{
      background: 'papayawhip',
      width: '100%',
      padding: '2rem'
    }}
  >
    {children}
  </div>
);

const Title = () => <Button>{x}</Button>;

render(
  <Wrapper>
    <Title />
  </Wrapper>
);`;
      const { code, imports, importsRaw } = extractImports(source);

      expect(imports).toEqual([
        '@rescui/typography',
        { imported: ['default'], local: 'Button', source: '@rescui/button' },
        { imported: ['default'], local: 'x', source: './x' },
        { imported: [], local: 'b', source: './b' }
      ]);

      expect(importsRaw).toEqual([
        "import '@rescui/typography';",
        "import Button from '@rescui/button';",
        "import x from './x';",
        "const b = require('./b');"
      ]);

      expect(code).toEqual(`const a = 1;

const Wrapper = ({ children }) => (
  <div
    style={{
      background: 'papayawhip',
      width: '100%',
      padding: '2rem'
    }}
  >
    {children}
  </div>
);

const Title = () => <Button>{x}</Button>;

render(
  <Wrapper>
    <Title />
  </Wrapper>
);`);
    });
  });
});
