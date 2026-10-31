export default {
'apps/*/src/**/*.{js,ts,tsx}': ['eslint --fix', 'prettier --write'],
'apps/*/src/**/*.{ts,tsx}': () => 'npm run typecheck',
};