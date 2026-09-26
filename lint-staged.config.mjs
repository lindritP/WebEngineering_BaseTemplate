export default {
  // Only staged source files: lint (with auto-fix), then format
  'src/**/*.{js,ts}': ['eslint --fix', 'prettier --write'],
  // Type-check the whole project whenever a .ts file is staged
  'src/**/*.ts': () => 'tsc --noEmit',
};