# 扩展边界

本仓库刻意保持为单一模板，不是 Monorepo，也不是共享组件包。

## 模板拥有

- `src/core/`：配置、HTTP、认证、权限、服务契约、主题、i18n。
- `src/components/`：可编辑的 UI 基础组件与共享应用组件。
- `src/layouts/`：响应式外壳行为与呈现。
- `src/modules/`：认证、用户、角色与菜单。
- `src/bootstrap/`：React 之前的启动门。

这些目录不能导入 `src/project/`。项目值由 `src/app/` 注入，或传入 core 工厂。

## 依赖方向

`.dependency-cruiser.cjs` 对生产代码执行以下硬性规则：

- 禁止循环依赖。
- `src/core/` 保持领域中立，不依赖 adapter、app、bootstrap、组件、layout、module 或 project。
- `src/components/ui/` 不反向依赖 `components/common`；整个 components 层不依赖业务与组装层。
- `src/layouts/` 只负责展示，不依赖 adapter、app、bootstrap、module 或 project。
- `src/modules/` 不依赖 app、bootstrap、layout 或 project。
- `src/adapters/` 只向内依赖 core，不依赖 UI、业务模块或组装层。
- 生产代码禁止导入测试文件。

本地和 CI 均通过以下命令检查；该命令已包含在 `pnpm verify` 中：

```bash
pnpm check:architecture
```

## 项目拥有

- 品牌标识（缩写标记与 edition 文案）与 CSS 覆盖；应用显示名称唯一来源是
  运行时配置的 `app.name`。
- 注册的项目路由与导航元数据。
- REST 适配器组装与后端字段映射。
- 编译期受信任的 API/OIDC 源。
- 运行时配置。

通过 `src/project/routes.tsx` 中类型化的 `projectRoutes` 数组添加受保护的应用页面。每一项必须
提供静态可分析的 `lazy: () => import('...')`、路由元数据与所需能力；route module 导出
`Component`，可按需增加 `preload` 与 `shouldRevalidate`。`preload` 只能使用注入的 `request`、
全局唯一 `queryClient` 与领域无关 `services`，并优先复用模块内的 `queryOptions`。

`src/app/routeRegistry.ts` 将项目条目与模板路由合并，`src/app/router.ts` 再生成 React Router 8
Data Mode route objects。受保护分支先运行认证 middleware，叶子路由再运行 capability middleware；
两者都在业务 loader 前 fail-closed。父级 loader 预取应用菜单，页面 loader 预热对应 Query 缓存，
OIDC 回调也在 loader 中完成，不把应用级副作用放回组件 effect。`RequireAuth` 仅保留为页面停留
期间 logout、会话过期或 401 清理后的响应式兜底。

`src/app/navigation.ts` 把授权路由和后端菜单组合为纯展示导航模型。同一份路由定义驱动挂载、
权限、登录后跳转、数据预取与导航元数据，layout 不直接读取业务数据。

允许修改模板拥有的文件，但会增加升级冲突风险。架构门禁会在日常验证和发布前报告反向导入。
