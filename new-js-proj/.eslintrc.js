const config = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    sourceType: "module"
  },
  //extends: ['@magento'],
  rules: {
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off'
  }
};

module.exports = config;