# Webpack utils for parsing mdx with live playgrounds

To use with webpack 5, use this loader:

```js
const mdxWithPlaygroundsLoaders = require('mdx-with-playgrounds')();

const webpackConfig = {
  // ...
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          // your project babel loader
          babelLoader,
          ...mdxWithPlaygroundsLoaders
        ]
      }
    ]
  }
};
```

## Module API

```js
const mdxWithPlaygroundsLoaders = require('mdx-with-playgrounds')({
  remarkPlugins: [],
  rehypePlugins: []
});
```

For more information, see [MDX docs](https://mdxjs.com/advanced/plugins/)
