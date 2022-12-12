const config = {
  parser: '@babel/eslint-parser',
  extends: ['eslint:recommended'],
  rules: {
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off'
  }
};

module.exports = config;