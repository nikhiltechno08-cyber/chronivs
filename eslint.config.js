import baseConfig from '@chronivs/config/eslint/base';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['apps/backend/**', '**/.venv/**'],
  },
];
