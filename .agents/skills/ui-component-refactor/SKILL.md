---
name: ui-component-refactor
description: 按本项目规范重构 src/components/ui 下的基础组件——参数与交互对齐 Ant Design 对应组件的常用子集，视觉沿用模板设计令牌体系。用于新增或重构 Table、Select、DatePicker、Tree、Tabs 等数据展示/选择类 ui 基础组件，或审查此类组件是否符合项目形态。不适用于 Form（本仓库表单走受控 Dialog + 手工字段，与 antd Form 范式不同）。
---

# UI 组件重构（antd 参数子集 + 模板视觉）

把 `src/components/ui/*` 的基础组件重构为「**API 对齐 Ant Design 常用子集，视觉对齐模板令牌体系**」的形态。参考实现：`src/components/ui/table.tsx`（高层 `Table`）+ `src/components/ui/table.test.tsx`。

## 目标形态

每个组件文件内部分两层：

1. **低层基元**（shadcn 形态）：保留/新建 Radix + cva + 内联 Tailwind 的原子组件
   （如 `TableRoot/TableHead/TableCell`），供组合层与存量调用方复用。
2. **高层组件**（antd 形态）：受控组件，props 命名与语义对齐 antd 对应组件的常用子集
   （如 `columns/dataSource/rowKey/loading/pagination/rowSelection/sorter/size`）。

命名冲突时高层组件占用主名（`Table`），低层基元改名让位（`Table` → `TableRoot`），
并用 `lsp references` 找到全部调用方一次性迁移，不留别名或 re-export。

## API 设计规则

1. **只做常用子集，明确非目标**。antd 的长尾能力（固定列、虚拟滚动、expandable、树形、
   filters、summary 等）默认不实现，除非当前需求用到。在组件 JSDoc 或交付说明里写清非目标。
2. **受控优先**：分页、选中、排序方向等状态由调用方持有，组件只发回调
   （`onChange(page)`、`onChange(keys, rows)`、`onSortChange(columnKey, order)`）。
   仅纯 UI 瞬态（如本地排序方向）允许内部 `useState`。
3. **本地/服务端双模式**：能本地计算的行为传函数/配置即本地处理（如 `sorter: (a, b) => number`
   本地排序）；服务端模式的开关按行为区分——排序传 `sorter: true` 并经 `onSortChange` 通知；
   分页则是「后端只回当前页数据 + 传 `total`」，组件发现 `dataSource.length <= pageSize`
   时不做本地切片。在 JSDoc 里写清两种模式的判定方式。
4. **rowKey/getKey 用函数** `(record: T) => string`，与仓库既有惯例一致，不用字符串路径。
5. **每个 props 逐项写中文 JSDoc**（AGENTS.md 约定 4）：抽显式 `XxxProps` 并 `export`，
   写清作用、可选值、与 antd 的差异点。
6. **类型全部从组件文件导出**（`TableColumn<T>`、`TablePagination` 等），调用方从
   `@/components/ui/<name>` 导入，不建集中类型文件。

## 视觉规则

1. 颜色只引用 `src/styles/tokens.css` 令牌：`var(--gold)`、`var(--t1..t3)`、
   `var(--border)`、`var(--card)`、`var(--icon)` 等，禁止硬编码 hex/rgb。
   混色用 `color-mix(in srgb, var(--x) N%, transparent)`。
2. 模板视觉基调（对照 `table.tsx` 现状）：圆角 14px 卡片容器 + `var(--border)` 边框；
   表头/次要文字用 11px 大写 + `tracking-[0.04em]` + `var(--t3)`；hover 用浅金
   `color-mix(gold-light 35%)`；激活/选中态用 `var(--gold)` / `var(--gold-light)`。
3. light/dark/system 三主题靠令牌自动生效，不写 `dark:` 特判；交付前两种主题都实际看过。
4. 图标一律用 `@/components/ui/icon` 的 `Icon`（sprite 单一来源，1.8 线宽），
   禁止直接引 lucide-react；sprite 缺字形先补 `public/icons.svg` symbol 并同步
   `ICON_NAMES`（一致性有测试守护）。尺寸 11–16px 对齐现有组件。
5. 无障碍属性跟上交互：排序表头用真 `<button>` 且带 `aria-sort`，复选框带 `aria-label`，
   分页容器带 `aria-label={t('common.pagination')}`——所有 aria-label 一律走 i18n
   （AGENTS.md 约定 10，无 landmark 英文豁免）。

## i18n 规则

组件内固定文案（空态、加载中、全选、分页摘要等）走 `useTranslation()` 读 `common.*`，
新键**同时**写入 `src/core/i18n/locales/zh-CN.json` 与 `en-US.json`（结构一致，缺一即未完成）。
已有键先复用：`common.empty/loading/previous/next/selectAll/selectRow/pageInfo`。

## 迁移规则

1. 动手前 `lsp references` / `grep` 找齐旧基元全部调用方（含 `src/components/common/*` 包装层）。
2. 存量包装组件（如 `DataTable`）保持对外 API 不变，只把内部指到新基元；
   移动端卡片切换（`.mobile-data-*` + `responsive.css`）不动。
3. 干净切换：不留旧名 re-export、别名或废弃注释。

## 移动端约束（AGENTS.md 约定 12：本项目移动端适配为「需要」）

高层组件（如 `Table`）默认只有桌面形态，移动端可用性由包装层负责
（`DataTable` 的 `.mobile-data-*` 卡片切换）。因此：

1. **页面禁止绕过包装层直接用高层 Table 类组件**，除非同时提供移动端形态；
   新做的高层组件要么内建 768px 以下的降级布局，要么在 JSDoc 里写明
   「仅桌面，页面须经 XxxWrapper 使用」并提供对应包装层。
2. 新增/改动页面必须在 1440×900 / 768×1024 / 390×844 三档视口实际看过。

## 验证清单（顺序执行）

1. 新组件补单测（`src/components/ui/<name>.test.tsx`，参考 `table.test.tsx`）：
   只测新引入的可观察契约——受控回调、模式切换（本地/服务端）、状态循环、空态。
   测前 `await initializeI18n('zh-CN')`，`afterEach(cleanup)`。
2. `pnpm exec vitest run src/components/ui/<name>.test.tsx` 通过。
3. `pnpm verify` 全绿（改了 i18n locale 即算公共模块，必须全量）。
4. 浏览器冒烟：登录 dev server 实走使用该组件的页面，确认渲染与交互。
   注意：页面 `page-enter` 进场动画在无头浏览器截图时 opacity 可能停在 0，
   截图前先 `document.querySelector('.page-enter').style.opacity = '1'`。
5. 涉及视觉基线覆盖的页面（`tests/visual/*.spec.ts`），跑 `pnpm visual` 确认基线仍通过
   （不在 `pnpm verify` 里，需单独执行）；交互流程有 E2E 覆盖时连同 `pnpm e2e`。

## 陷阱

- ESLint `max-lines`(300) 豁免 `src/components/ui/**`，但仍应克制——超过 ~350 行说明
  子集切得太大，砍掉长尾参数。
- 项目规则禁止单表达式小函数（内联它）；小型静态查表用 `Record`，运行时集合才用 `Set/Map`。
- Radix `asChild` 与 NavLink 函数型 className 不兼容（AGENTS.md 约定 3）。
- helpers 之间有调用关系时注意声明顺序（`const` 无提升）。
- 非 `@layer` 的普通 CSS 优先级高于 Tailwind v4 的 `@layer utilities`:`base.css` 里的
  `button { color: inherit }` 会压过按钮上的 `text-[var(--gold)]` 等工具类。全局样式文件
  必须以 `@import './xxx.css' layer(base)` 引入(globals.css 已如此处理 base.css);
  新增全局元素级规则时同理。改层级后视觉基线会整体微调,需重录。
