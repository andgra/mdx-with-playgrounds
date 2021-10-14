const remarkPlugin = require('./remark-plugin');

module.exports =
  (mdxOptions = {}) => {
    const remarkPluginsFromOptions = mdxOptions.remarkPlugins || [];

    return [
      {
        loader: require.resolve('./inner-require-loader')
      },
      {
        loader: require.resolve('@mdx-js/loader'),
        options: {
          ...mdxOptions,
          remarkPlugins: [...remarkPluginsFromOptions, remarkPlugin]
        }
      }]
  };
