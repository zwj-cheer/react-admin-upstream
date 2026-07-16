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
  {
    // 发现体系护栏：业务层日期展示必须走 `@/core/datetime` 封装，禁止散装格式化。
    // 目的是让生态膨胀时，写错的人被 lint 直接拦下并导向既有工具，而非重复造轮子。
    // `src/core/datetime` 自身是封装实现，豁免。
    files: ['src/modules/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/layouts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'dayjs',
              message: '业务层禁止直接使用 dayjs，请从 @/core/datetime 引入 formatDate/formatDateTime/formatFromNow 等统一封装。',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']",
          message: '禁止用 Intl.DateTimeFormat 手写日期格式，请用 @/core/datetime 的统一封装。',
        },
        {
          selector:
            "CallExpression[callee.property.name=/^toLocale(Date|Time)?String$/]",
          message: '禁止用 toLocaleString/toLocaleDateString 展示日期，请用 @/core/datetime 的统一封装。',
        },
      ],
    },
  },
])
