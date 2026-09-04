/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
  '*.py': ['ruff check --fix', 'ruff format'],
};
