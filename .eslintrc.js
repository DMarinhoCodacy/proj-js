module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    },
    plugins: [
            '@typescript-eslint/eslint-plugin',
            'simple-import-sort',
            'unused-imports',
    ],
    extends: [
            'plugin:@typescript-eslint/recommended',
            'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    rules{}
};