import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    'playwright-report',
    'public/mockServiceWorker.js',
    'test-results',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/core/auth/AuthProvider.tsx',
      'src/core/config/RuntimeConfigProvider.tsx',
      'src/core/services/ServicesProvider.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // 组件文件行数红线：超过 300 行（不含空行/注释）说明职责过多，应按组合模式拆分。
    // shadcn/Radix 源码（src/components/ui/）豁免。
    files: ['**/*.tsx'],
    ignores: ['src/components/ui/**'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    },
  },
])
