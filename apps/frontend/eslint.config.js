import nextjsConfig from '@chronivs/config/eslint/nextjs';
import nextPlugin from '@next/eslint-plugin-next';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    name: 'next/core-web-vitals',
    plugins: {
      '@next/next': nextPlugin,
    },
  },
  ...nextjsConfig,
];
