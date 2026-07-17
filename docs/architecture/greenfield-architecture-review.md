# 绿地架构审查与重建路线

> 审查日期：2026-07-17  
> 审查口径：把仓库视为新项目，不保留仅为历史兼容存在的 API、抽象或组件；以 React 19、
> React Router 8、TanStack Query、shadcn/ui 与 Playwright 当前推荐形态为目标。

## 结论

仓库已有几项值得保留的强基础：React 挂载前的运行时配置门、受信任源校验、Cookie/OIDC 双认证、
统一 HTTP 错误、能力权限、主题与 i18n、MSW，以及桌面/移动端双形态 `DataTable`。当前主要问题
不是缺少能力，而是同时维护了三套边界不同的架构：

1. `src/core/services` 的横向服务总线；
2. `src/modules/*` 的纵向功能模块；
3. `src/components/ui` 中“shadcn 视觉 + Ant Design 参数”的第二套组件框架。

三者叠加后，出现了领域类型进入 `core`、`layouts` 反向依赖 `modules`、页面无法复用 Query 配置、
基础组件重复实现焦点与键盘状态机等问题。目标不是继续补适配层，而是收敛为一条清晰路径：

```text
bootstrap ──创建──> app runtime / router
                       │
                       ├──组合──> layouts（纯展示外壳）
                       ├──组合──> modules（垂直业务切片）
                       ├──注入──> core（领域无关基础能力）
                       └──注入──> adapters（外部系统实现）

modules ──使用──> components/common ──组合──> components/ui
modules ──使用──> core
adapters ──使用──> core/http 与服务契约

禁止：core/components/layouts/modules ──> app/project
禁止：layouts ──> modules/adapters
禁止：components/ui ──> 业务模块或业务类型
```

## 取证摘要（改造前）

- `madge` 扫描 171 个文件，当前没有循环依赖。
- 生产构建成功，但首屏主块约 309 kB（gzip 91 kB），业务路由虽已懒加载，路由数据仍在组件挂载
  后请求，未利用 React Router Data Mode 的 loader、pending 与错误边界。
- `shadcn info --json` 将已安装组件识别为 `0`，且把 `@/components/ui` 解析到了仓库根目录下的
  字面量 `@/` 路径。原因是根 `tsconfig.json` 没有暴露 `baseUrl/paths`；这会让 CLI 的新增、diff
  与组件发现流程失真。
- `knip` 报告 13 个未使用文件、25 个未使用导出和 11 个未使用导出类型。多项 UI 组件只有自身
  单测，没有生产消费者，违背 shadcn/ui“按需加入源码”的模型。
- `scripts/check-extension-boundaries.mjs` 没有被任何 npm script 调用；README 所述边界并未由该
  脚本实际守护。现有 `verify-template.mjs` 只检查 `project` 反向导入，无法阻止
  `layouts -> modules` 等层级倒置。
- `layouts/Sidebar.tsx` 直接调用 `modules/menus` 的 Query，`layouts/navigation.ts` 直接复用菜单
  模块算法；`modules/auth/LoginPage.tsx` 又反向导入 `layouts/types.ts`。
- `AppProviders` 在 `useMemo` 中执行 `configureOidc` 并创建运行时对象；`AuthProvider` 与
  `RequireAuth` 都会触发会话恢复。React 渲染阶段因此承担了本应由 composition root 完成的初始化。
- 三个业务模块直接手写 Query Key，查询配置无法供路由 loader、预取和测试复用；查询函数没有
  传递 TanStack Query 提供的 `AbortSignal`，分页也没有 `placeholderData`。
- `src/adapters/rest/schemas.ts` 放置了用户、角色、菜单、会话四类资源专属 schema，与项目的
  API 类型共置规则相反。
- `Select`、`OtpInput`、`Avatar`、`Segmented`、`Progress` 与移动导航分别重做了成熟 primitive
  已提供的焦点、键盘、失败回退、ARIA 或遮罩逻辑。移动导航没有模态焦点约束。
- UI 层存在手工 overlay `z-index`、嵌套交互元素规避、按钮 `loading`、选项数组式 Tabs/Radio 等
  与官方 shadcn 组合规则相冲突的 API。
- 主题只映射了少量 Tailwind 语义色，尚未形成完整的 `background/foreground/popover/muted/
accent/destructive/input/ring` 令牌集，因此官方 registry 组件不能无修改落地。
- 存在用户可见硬编码：移动导航英文 `aria-label`、登录页 `OR`、语言选项；Zod 默认错误文案也会
  直接以英文展示。
- Playwright 覆盖了关键流程，但 a11y 只拦截 serious/critical，存在固定等待，视觉矩阵没有覆盖
  所有内置页面和双主题。
- 依赖版本存在有意或无意的跨代组合：React/Vite 已较新，但 Zod 3、resolver 3、Sonner 1 与
  React Router 7 已落后于当前稳定主版本。

## 目标决策

### 1. 保留

| 能力                           | 决策             | 理由                                               |
| ------------------------------ | ---------------- | -------------------------------------------------- |
| React 前运行时配置门           | 保留并收紧       | 静态部署中非常有价值，且已有严格 schema 与信任边界 |
| `HttpClient`                   | 保留为基础设施   | 超时、CSRF、401 通知和错误归一化职责清晰           |
| AuthService + Zustand 会话快照 | 保留但解耦初始化 | Zustand 只保存客户端会话快照，不承载服务端列表数据 |
| i18n / theme                   | 保留             | 都是明确的客户端全局状态                           |
| `DataTable`                    | 保留             | TanStack Table + 移动端卡片降级符合本模板能力要求  |
| MSW + Vitest + Playwright      | 保留             | 测试层次正确，只需补齐稳定性与矩阵                 |
| `src/project` 扩展边界         | 保留             | 对上游模板很重要，但改用真实依赖图工具守护         |

### 2. 删除

| 项目                                   | 原因                                                           |
| -------------------------------------- | -------------------------------------------------------------- |
| 只有单测、没有生产消费者的预制 UI 组件 | shadcn/ui 应按需从 registry 加入；预先维护会持续漂移           |
| 未使用的 core barrel 与公开导出        | 增加发现噪声和重构成本；仅保留稳定公共入口                     |
| 未接入验证链的重复边界脚本             | 以 dependency graph 规则替代文本正则                           |
| 无消费者的高层 façade 参数             | UI 基元采用官方 compound API，高层业务语义放 `common` 或模块内 |

### 3. 替换

| 当前实现                                               | 目标实现                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| React 渲染期创建 QueryClient/Services/AuthService/OIDC | `bootstrap -> createAppRuntime()` 一次性创建并启动                                |
| `BrowserRouter + Routes + React.lazy`                  | React Router Data Mode；route object、lazy route module、loader 与 error boundary |
| 页面内散装 `useQuery` 配置                             | 资源级 Query Key factory + `queryOptions`；hook/loader/prefetch 共用              |
| 查询忽略取消信号                                       | Query `signal` 贯穿 service contract、adapter 与 `HttpClient`                     |
| 本地分页切换时清空内容                                 | `placeholderData: keepPreviousData`，保留旧页并显示后台获取状态                   |
| `layouts` 自取业务菜单                                 | `app`/模块容器生成导航 view model，再通过 props 注入纯展示 layout                 |
| 手写移动抽屉                                           | shadcn `Sheet`/`Sidebar`，交由 Radix 管理遮罩、Escape 与焦点                      |
| 手写 Select/OTP/Avatar/Segmented/Progress              | 官方 Select/Combobox、input-otp、Radix Avatar、ToggleGroup、Radix Progress        |
| 原始字段 CSS 与英文 Zod message                        | shadcn `Field*` + `aria-invalid` + i18n 错误键                                    |
| 少量品牌变量直接散用                                   | 完整 shadcn 语义 token，品牌色作为 `primary` 的来源                               |
| 文本正则边界检查                                       | dependency-cruiser + ESLint 双层护栏                                              |

### 4. 重建

#### 应用运行时

`createAppRuntime(config)` 是唯一 composition root，负责创建 QueryClient、HTTP/REST services、
OIDC manager 与 AuthService。React Provider 只接收已创建实例，不在 render/useMemo/effect 中做
应用级初始化。

#### 路由与数据

路由定义同时承载 path、权限、标题、图标、lazy module 与 loader。列表筛选/分页写入 URL；loader
通过同一份 `queryOptions` 调用 `ensureQueryData`，组件通过 `useQuery` 订阅缓存。权限与登录跳转在
路由层 fail-closed，页面不再各自拼装加载瀑布。

#### UI 分层

- `components/ui`：只放官方 shadcn/Radix/Base primitive 源码和必要的品牌变体；采用 compound API。
- `components/common`：放 `DataTable`、`AsyncState`、`ConfirmDialog`、状态徽标等跨业务组合。
- `modules/*`：放带领域语义的表单、列定义、对话框与 view model。

不再追求让每个 primitive 模拟 Ant Design API。若某个业务确实需要 Ant Design 形状，在模块或
`common` 创建窄适配器，不污染所有基础组件。

#### API 与领域类型

资源专属 wire schema、请求/响应类型与解析函数共置在各自 adapter 文件；`schemas.ts` 只保留真正
跨资源共享的 schema。`core/services/contracts.ts` 只表达端口契约和跨资源领域概念，不充当所有
API 类型的集中仓库。

## 实施顺序

### P0：先修发现体系与架构门禁

1. 修复 TypeScript 根别名，让 shadcn CLI 能发现真实组件路径。
2. 用 dependency-cruiser 守护无循环、层级方向和 project 边界，并接入 `pnpm verify`。
3. 删除无生产消费者的预制组件与无用导出；引入可重复运行的 dead-code 检查。
4. 把本次审查文档与 README/AGENTS 能力地图同步。

### P1：收拢运行时与服务端状态

1. 把应用对象创建移出 React 渲染阶段。
2. 建立 Query Key factory 与 `queryOptions`，贯通 AbortSignal。
3. 分页查询使用 `keepPreviousData`；列表状态迁移到 URL。
4. 将资源专属 Zod schema 移回各 adapter。

### P2：重建 UI primitive 层

1. 先迁移当前有消费者的 Avatar、Select/Input、Dialog/Confirm、移动导航。
2. 引入完整 shadcn semantic tokens、Field、InputGroup、Textarea、Badge、Skeleton。
3. 删除 Button loading、数组式 Tabs/Radio 等基础层高层 façade。
4. 所有用户可见与 ARIA 文案接入 i18n。

### P3：升级路由模型

1. 升级到当前稳定 React Router 主版本并采用 Data Mode。
2. 以 route objects/handles 统一路由、权限、导航和页面元数据。
3. 用 loader 预取 Query，补 route error boundary、pending UI 与用户意图预加载。

### P4：升级依赖与测试质量

1. 升级 Zod、resolver、Sonner、TypeScript 等当前稳定主版本；每个主版本独立验证。
2. a11y 改为零违规门禁并加入 WCAG 2.2、焦点返回与完整键盘流程。
3. 内置页面补齐 light/dark × 1440/768/390 视觉矩阵。
4. 去掉固定等待，使用语义状态、响应或动画完成条件。
5. 在测试状态完全隔离后开启 Playwright 并行。

## 可量化验收标准

- `shadcn info --json` 的 `resolvedPaths.ui` 指向真实 `src/components/ui`，组件发现不再为 0。
- dependency-cruiser 无循环、无任何禁止层级边。
- `pnpm verify`、`pnpm e2e`、`pnpm visual`、`pnpm a11y` 全绿。
- `components/ui` 中没有仅供未来使用的自制状态机；新增组件均能追溯到 registry 或明确 ADR。
- 每个 Query 资源有稳定 Key factory 与复用的 `queryOptions`；可取消查询 100% 传递 signal。
- 列表翻页/筛选不闪回全屏 loading，URL 可复制并恢复当前视图。
- 所有内置页面在三档视口和 light/dark 下有可审阅基线。
- 用户可见硬编码与 Zod 默认英文错误为 0。
- a11y 扫描不再只过滤 serious/critical，而是对目标规则集零违规。
- 无未解释的未使用文件、依赖、导出或边界脚本。

## 本轮落地状态

- P0 已完成：shadcn CLI 发现恢复正常，dependency-cruiser 与 Knip 接入 `pnpm verify`，无消费者
  primitive、旧 façade、无用导出和重复边界脚本已删除。
- P1 已完成：`createAppRuntime()` 成为 composition root，Query Key factory、`queryOptions`、
  AbortSignal、`keepPreviousData`、列表 URL 状态与 adapter schema 共置均已落实；route loader 与组件
  使用同一份 Query 配置和唯一 QueryClient。
- P2 已完成现有生产消费者的迁移：Avatar、Select、ToggleGroup、Sheet、AlertDialog、Field、
  InputGroup、Textarea 使用社区 primitive 组合；移动导航由 Radix 管理遮罩、Escape、滚动锁、
  焦点约束和焦点返回；主题具备完整 shadcn 语义 token 映射。
- P3 已完成：升级到 React Router 8.2.0，采用 `createBrowserRouter` + `RouterProvider`；路由对象承载
  lazy route module、handle、loader、error boundary 与 `shouldRevalidate`。认证和 capability middleware
  在业务 loader 前 fail-closed；父 loader 预取菜单，用户 loader 并行预取用户与角色，角色 loader
  预取角色；OIDC 回调迁入 loader，全局 pending 由 `useNavigation()` 驱动。
- P4 已完成 Zod、resolver、Sonner 等兼容升级，移除固定等待；axe 对 WCAG 2.0/2.1 A/AA 与
  WCAG 2.2 AA 新规则执行零违规门禁。登录、用户、角色、菜单四个内置页面均已覆盖
  light/dark × 1440×900 / 768×1024 / 390×844，共 24 张视觉基线。Playwright 已启用
  `fullyParallel` 与 2 workers，并用 E2E `repeat-each=2` 的 16 次并行执行证明 Mock/会话数据隔离。

最终复查时，`shadcn info --json` 能识别 Vite、Tailwind v4、Radix、正确别名和 18 个已安装组件；
`pnpm verify`（43 个文件、139 个 Vitest）、`pnpm e2e`（8 项）、`pnpm visual`（24 项）、
`pnpm a11y`（4 项）均通过。

## 有意保留的兼容性锁定

以下版本不是遗漏，而是由上游兼容矩阵决定；解除条件必须是对应工具先发布正式支持：

1. TypeScript 固定在最新受支持的 6.0.3：当前稳定 7.0.2 已发布，但最新
   `typescript-eslint@8.64.0` 的 peer 范围仍是 `>=4.8.4 <6.1.0`；不得用忽略 peer 的方式制造
   “伪最新”。
2. dependency-cruiser 固定在 17.4.3：18.1.0 只支持 Node `^22 || ^24 || >=26`，会明确拒绝本模板
   当前允许且验证使用的 Node 25；待项目最低 Node 切换到受支持的偶数 LTS 后再升级。
