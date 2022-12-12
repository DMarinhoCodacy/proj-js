const config = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false
  },
  //extends: ['@magento'],
  rules: {
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off'
  }
};

module.exports = config;