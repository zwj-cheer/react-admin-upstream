# 项目规则

## 项目能力配置

以下能力开关在**项目初始化时确定一次**，此后所有开发遵循固化值，不再重复询问：

| 能力 | 当前值 | 说明 |
| --- | --- | --- |
| 国际化（zh-CN / en-US） | 必须 | 固定必须，不可关闭 |
| 主题切换（light/dark/system） | 必须 | 固定必须，不可关闭 |
| 移动端适配 | 需要 | 初始化时询问用户后固化 |

- 基于本模板初始化下游项目时，大模型必须**先询问用户是否需要移动端适配**，把答案写入上表
  后再开始开发，之后不得凭猜测偏离。
- "移动端适配 = 需要"意味着：新增页面必须在 1440×900 / 768×1024 / 390×844 三档视口下可用，
  沿用模板的响应式外壳（移动端抽屉、`src/styles/responsive.css`），相关视觉与 E2E 基线必须
  覆盖并通过。
- "移动端适配 = 不需要"意味着：只保证桌面视口，可跳过移动端视觉基线，但不得删除模板的
  响应式基础设施（升级会冲突）。

## Agent Skills

- 本项目以 `.agents/skills/` 作为项目本地 skill 的**事实来源**，`.claude/skills/` 与
  `.gemini/skills/` 只是指向它的软链接集合。
- 新增、删除或重命名 `.agents/skills/*` 后，必须运行同步脚本补齐/清理软链接：

  ```bash
  bash .agents/skills/sync-agent-skills/scripts/sync-agent-skills.sh
  ```

- 来自远端仓库的 skill 由 `skills-lock.json` 锁定来源与内容哈希（通过 `npx skills add` 管理）；
  `api-type-colocation` 与 `sync-agent-skills` 为项目本地 skill，直接编辑。
- opencode 原生搜索 `.agents/skills/` 与 `.claude/skills/`，**不要**新建 `.opencode/skills/`
  或把它加入同步脚本，否则同一 skill 会在多个位置重复发现。
- 可用 skill：`api-type-colocation`（API 类型组织）、`core-tool-registry`（新增 core 工具/组件
  时如何登记进发现体系）、`sync-agent-skills`（软链接同步）、`ui-component-refactor`（ui 基础
  组件重构规范）、`playwright-best-practices`、`shadcn`、`tanstack-query`、
  `vercel-composition-patterns`、`vercel-react-best-practices`。

## 既有能力地图

**动手写任何工具函数、hook 或通用组件前，先查这张表。** 目的是防止生态膨胀后重复造轮子：
需求已有封装的，一律复用；表里没有、确需新增的，按 `core-tool-registry` skill 登记回本表。
带 ESLint 护栏的封装，绕开写散装实现会被 lint 直接拦下。

| 需求 | 用这个 | 位置 | 护栏 |
| --- | --- | --- | --- |
| 日期/时间展示 | `formatDate` / `formatDateMinute` / `formatDateTime` / `formatTime` / `formatFromNow` | `@/core/datetime` | ✅ 禁散装 `Intl.DateTimeFormat` / `toLocaleDateString` / 直接 `dayjs` |
| 权限判断 | `authorize` / `<Can>` / `capabilities` | `@/core/permissions` | — |
| 路由元数据/菜单/守卫 | `RegisteredRoute` / `useRouteRegistry` / `useAuthorizedRoutes` | `@/core/routing` | — |
| HTTP 请求（带 token/CSRF/401） | `HttpClient` + adapter | `@/core/http`、`@/adapters/rest` | — |
| 主题（light/dark/system） | `useThemeStore` / `resolveThemePreference` | `@/core/theme` | — |
| 国际化 | `useTranslation` / `setLocale` | `react-i18next`、`@/core/i18n` | — |
| 认证会话 | `useAuthStore` / `useAuthService` | `@/core/auth` | — |
| 运行时配置 | `useRuntimeConfig` / `parseRuntimeConfig` | `@/core/config` | — |
| 数据表格（桌面/移动自适应） | `DataTable` | `@/components/common` | — |
| 表格（antd 形态，范式参考） | `Table` 是两层重构的范式参考，暂无生产消费者；业务列表页一律用 `DataTable`（移动端卡片降级），勿直接消费高层 `Table` | `@/components/ui/table` | — |
| 异步态（loading/error/empty） | `AsyncState` | `@/components/common` | — |
| 二次确认弹窗 | `ConfirmDialog` | `@/components/common` | — |
| className 合并 | `cn` | `@/core/utils` | — |
| 基础 UI 组件（Button/Input/Select/Table…） | shadcn 形态组件 | `@/components/ui` | — |

> `@/core/*` 每个域都提供具名导出的 barrel `index.ts`（禁 `export *`，避免 Vercel skill 指出的
> barrel 成本），配合编辑器 auto-import 即可被发现；写代码时优先按上表路径 import。

## 关键约定

1. **API 类型共置**：与单个后端资源强绑定的请求/响应类型放在对应的
   `src/adapters/rest/*Adapter.ts` 文件里并从那里导出，不建集中式类型文件；真正跨资源共享的
   Zod schema 放 `src/adapters/rest/schemas.ts`；服务契约在 `src/core/services/contracts.ts`。
   详见 `api-type-colocation` skill。
2. **主题体系以 CSS 变量为唯一真相，并按 shadcn 官方标准以 `.dark` 类切换**：设计令牌集中在
   `src/styles/tokens.css`，浅色挂在 `:root`、深色挂在 `.dark`（Tailwind 的 `dark:` variant
   经 `globals.css` 的 `@custom-variant dark (&:is(.dark *))` 生效）；切换只在
   `<html>` 上增删 `dark` 类（见 `themeStore.ts` / `resolvePreferences.ts`），禁止再用
   `[data-theme]` 属性；`src/components/ui/` 的组件按 shadcn 官方形态用 cva + 内联 Tailwind
   工具类实现，颜色一律引用令牌（`bg-[var(--gold)]`、`text-[var(--t1)]` 等），变体用
   `class-variance-authority` 定义（见 `button.tsx`）；应用级样式（`.card`、`.data-table`
   等）仍走 `src/styles/*.css` 语义类并挂到令牌；项目侧覆盖只写 `src/project/styles.css`，
   任何位置都不要硬编码 hex/rgb 颜色。
3. **Radix 的 `asChild` 不兼容 NavLink 函数型 className**（会被强转成字符串）。active 态用
   `useLocation` 手动计算后传普通字符串。
4. **自定义/扩展组件的 props 逐项写中文 JSDoc**：抽显式 `XxxProps` 并 `export`，写清作用、
   可选值与注意事项；原生透传属性不重复注释。
5. **组件文件不超过 300 行**（不含空行/注释，ESLint `max-lines` error 级强制，
   `src/components/ui/` 的 shadcn 源码豁免）。逼近红线时不要硬塞，按组合模式拆子组件或
   自定义 hook，参考 `vercel-composition-patterns` skill。
6. **写完/改完代码必须跑验证再收工**：日常用 `pnpm test:changed`（只跑与未提交改动相关的
   用例）；提交前或改动公共模块（`src/core`、`src/adapters`）时跑全量 `pnpm verify`
   （typecheck + lint + test + build + 模板检查）；改动涉及认证、路由守卫等已有 E2E 覆盖的
   流程时连同 `pnpm e2e` 一起跑。修 bug 先补一个能复现它的失败用例再修；测试失败时修代码
   或修用例，禁止 skip 或删除用例了事。
7. **写 E2E 前先在浏览器实际走通场景再下笔**，禁止凭想象编写选择器；locator/断言/mock 模式
   参照 `playwright-best-practices` skill。E2E 框架已定 Playwright，不引入 Cypress。
8. **模板/项目边界**：`src/core`、`src/components`、`src/layouts`、`src/modules` 不能导入
   `src/project/`（`scripts/check-extension-boundaries.mjs` 强制）；项目值只经 `src/app/`
   注入。下游扩展只改 `src/project/` 与运行时 JSON。
9. **提交走 husky pre-commit**（lint-staged：eslint --fix + prettier）。`pnpm lint` 和
   `pnpm build` 必须通过。
10. **所有用户可见文案必须走 i18n**：禁止在组件中硬编码中文或英文字符串，一律通过
    `useTranslation()` 的 `t()` 读取，键同时写入 `src/core/i18n/locales/zh-CN.json` 与
    `en-US.json`（两个文件的键结构必须保持一致，缺一个即视为未完成）。aria-label、placeholder、
    toast、错误提示同样适用。
11. **新增 UI 必须同时适配三种主题模式**（light/dark/system）：颜色只能引用
    `src/styles/tokens.css` 中的设计令牌（含 `.dark` 深色套），不允许写死
    hex/rgb 颜色值。交付前在浅色和深色下都实际看过，视觉用例覆盖的页面需确认基线仍通过。
12. **移动端适配按「项目能力配置」表执行**：当前值为「需要」，新增页面必须在
    1440×900 / 768×1024 / 390×844 三档视口下可用并通过对应视觉基线；不得在单个页面里
    私自决定"这个页面不用适配移动端"。
13. **造轮子前先查「既有能力地图」**：新增任何日期/权限/请求/主题等横切工具、通用 hook 或
    `components/common` 组件前，先在上文能力地图里找有没有现成封装；有则复用，没有再新增。
    新增后必须按 `core-tool-registry` skill 登记：域内 barrel 具名导出 + 回填能力地图 +
    （必要时）加 ESLint 护栏，让下一个人/模型能发现它、且写散装实现会被 lint 拦下。

## 文档语言

所有项目文档（`README.md`、`AGENTS.md`、`CHANGELOG.md`、`docs/` 下的全部文档）必须使用中文
编写。代码标识符、命令、路径、配置字段名保持原文。

## 运行时配置必须与文档同步

运行时配置文件是 `public/config/runtime.json`（由 `src/core/config/runtimeConfig.schema.ts`
校验）。

每当你在 `public/config/runtime.json` 中增加、删除或修改字段——或修改
`runtimeConfig.schema.ts` 中的校验规则——必须在同一次改动中同步更新
[`docs/architecture/runtime-config.md`](docs/architecture/runtime-config.md) 的字段参考，
保证文档始终描述每个字段的作用、类型/约束与默认值。

配置变更未附带对应的文档更新时，不允许合并。
