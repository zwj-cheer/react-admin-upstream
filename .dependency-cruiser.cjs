/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'core-is-domain-neutral',
      severity: 'error',
      from: { path: '^src/core/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/(adapters|app|bootstrap|components|layouts|modules|project)/' },
    },
    {
      name: 'ui-does-not-depend-on-common',
      severity: 'error',
      from: { path: '^src/components/ui/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/components/common/' },
    },
    {
      name: 'components-are-business-agnostic',
      severity: 'error',
      from: { path: '^src/components/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/(adapters|app|bootstrap|layouts|modules|project)/' },
    },
    {
      name: 'layouts-are-presentational',
      severity: 'error',
      from: { path: '^src/layouts/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/(adapters|app|bootstrap|modules|project)/' },
    },
    {
      name: 'modules-do-not-import-composition-layers',
      severity: 'error',
      from: { path: '^src/modules/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/(app|bootstrap|layouts|project)/' },
    },
    {
      name: 'adapters-only-depend-inward',
      severity: 'error',
      from: { path: '^src/adapters/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '^src/(app|bootstrap|components|layouts|modules|project)/' },
    },
    {
      name: 'production-does-not-import-tests',
      severity: 'error',
      from: { path: '^src/', pathNot: '[.](?:test|spec)[.](?:ts|tsx)$' },
      to: { path: '[.](?:test|spec)[.](?:ts|tsx)$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    includeOnly: ['^src/'],
    moduleSystems: ['es6'],
    tsConfig: { fileName: 'tsconfig.app.json' },
  },
}
