module.exports = {
  root: true,
  env: {
    es6: true,
    //browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:jest/recommended',
    'plugin:security/recommended'
  ],
  globals: {
    context: true,
    module: true,
    page: true,
    process: true,
    window: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    "babelOptions": {
      "presets": ["@babel/preset-react"]
   }
  },
  plugins: [
    'import',
    'html',
    'jsx-a11y',
    'prettier',
    'promise',
    'react',
    'react-hooks',
    '@typescript-eslint'
    // 'security'
  ],
  settings: {
    "jest": {
      "version": 26
    },
    "react": {
      "version": "detect"
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      node: {
        paths: ['src', './'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {
        alwaysTryTypes: true // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      }
    }
  },
  rules: {
    'func-names': ['error', 'never'],
    'import/no-unresolved': [2, { caseSensitive: true, commonjs: true }],
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-for': 0,
    'prefer-destructuring': 0,
    'react/destructuring-assignment': 0,
    'react/forbid-prop-types': [
      1,
      {
        forbid: ['any']
      }
    ],
    'react/jsx-closing-tag-location': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/no-access-state-in-setstate': 0,
    'react/no-did-mount-set-state': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'prettier/prettier': ['error', { arrowParens: 'avoid' }],
    'no-console': ['error', { allow: ['error', 'warn', 'info'] }]
  }
};