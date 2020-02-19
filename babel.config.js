module.exports = function(api) {
  api.cache(false);

  const presets = [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 2
      }
    ]
  ];
  const plugins = [
    'babel-plugin-transform-typescript-metadata',
    '@babel/plugin-transform-typescript',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-optional-catch-binding'
  ];

  return {
    sourceType: 'unambiguous',
    presets,
    plugins
  };
};
