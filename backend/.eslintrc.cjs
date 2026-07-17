/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 * Sample Eslint config for NodeJS ExpressJS MongoDB project
 */
module.exports = {
  env: { es2020: true, node: true },
  extends: [
    'eslint:recommended'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    allowImportExportEverywhere: true
  },
  plugins: [],
  // rules: {
  //   // Common
  //   'no-console': 1,
  //   'no-extra-boolean-cast': 0,
  //   'no-lonely-if': 1,
  //   'no-unused-vars': 1,
  //   'no-trailing-spaces': 1,
  //   'no-multi-spaces': 1,
  //   'no-multiple-empty-lines': 1,
  //   'space-before-blocks': ['error', 'always'],
  //   'object-curly-spacing': [1, 'always'],
  //   'indent': ['warn', 2],
  //   'semi': [1, 'never'],
  //   'quotes': ['error', 'single'],
  //   'array-bracket-spacing': 1,
  //   'linebreak-style': 0,
  //   'no-unexpected-multiline': 'warn',
  //   'keyword-spacing': 1,
  //   'comma-dangle': 1,
  //   'comma-spacing': 1,
  //   'arrow-spacing': 1
  // }
  rules: {
  // Common
  'no-console': 0,
  'no-extra-boolean-cast': 0,
  'no-lonely-if': 0,
  'no-unused-vars': 0,
  'no-trailing-spaces': 0,
  'no-multi-spaces': 0,
  'no-multiple-empty-lines': 0,
  'space-before-blocks': 0,
  'object-curly-spacing': 0,
  'indent': 0,
  'semi': 0,
  'quotes': 0,
  'array-bracket-spacing': 0,
  'linebreak-style': 0,
  'no-unexpected-multiline': 0,
  'keyword-spacing': 0,
  'comma-dangle': 0,
  'comma-spacing': 0,
  'arrow-spacing': 0
}
}
