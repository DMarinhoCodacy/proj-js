const config = {
  parserOptions: {
    parser: "@babel/eslint-parser",
    //requireConfigFile: false,
    //ecmaVersion: 2022,
  },
  extends: ['eslint-config-airbnb-base'],
  rules: {
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off'
  }
};

module.exports = config;