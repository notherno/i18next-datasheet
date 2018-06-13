const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = (storybookBaseConfig, configType) => {
  const {
    entry,
    resolve: { extensions },
    module: { rules },
  } = storybookBaseConfig

  storybookBaseConfig.resolve.extensions = [...extensions, '.ts', '.tsx']
  storybookBaseConfig.module.rules = [
    ...rules,
    {
      test: /\.tsx?$/,
      use: [{ loader: 'ts-loader' }],
    },
    {
      test: /\.css$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            // Necessary for external CSS imports to work
            // https://github.com/facebookincubator/create-react-app/issues/2677
            ident: 'postcss',
            plugins: () => [
              require('postcss-flexbugs-fixes'),
              autoprefixer({
                browsers: [
                  '>1%',
                  'last 4 versions',
                  'Firefox ESR',
                  'not ie < 9', // React doesn't support IE8 anyway
                ],
                flexbox: 'no-2009',
              }),
            ],
          },
        },
      ],
    },
  ]

  return storybookBaseConfig
}
