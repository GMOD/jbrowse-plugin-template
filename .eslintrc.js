module.exports = {
  root: true,
  extends: [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
  },
}
