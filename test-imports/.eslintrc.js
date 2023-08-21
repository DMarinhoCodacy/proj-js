module.exports = {
    env: {
      browser: false,
      commonjs: true,
      es2021: true,
      jest: true
    },
    extends: ['standard'],
    parserOptions: {
      ecmaVersion: 12
    },
    rules: {
      prettier: {
        'space-before-function-paren': ['error', 'never']
      }
    },
    plugins: ['jest']
  }