module.exports = function (api) {
    api.cache(true)
    const presets = [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '10',
          },
        },
      ],
    ]
    const plugins = [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/proposal-class-properties',
      'source-map-support',
    ]
    const base = { presets, plugins }
  
    // https://github.com/babel/babel/pull/7091#issuecomment-358125842
    return {
      overrides: [
        { sourceMaps: 'inline', include: /\.js$/, ...base },
        {
          include: /\.ts$/,
          sourceMaps: 'inline',
          plugins: base.plugins,
          presets: [...base.presets, '@babel/preset-typescript'],
        },
      ],
    }
  }