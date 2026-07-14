# 扩展边界

本仓库刻意保持为单一模板，不是 Monorepo，也不是共享组件包。

## 模板拥有

- `src/core/`：配置、HTTP、认证、权限、服务契约、主题、i18n。
- `src/components/`：可编辑的 UI 基础组件与共享应用组件。
- `src/layouts/`：响应式外壳行为与呈现。
- `src/modules/`：认证、用户、角色与菜单。
- `src/bootstrap/`：React 之前的启动门。

这些目录不能导入 `src/project/`。项目值由 `src/app/` 注入，或传入 core 工厂。

## 项目拥有

- 品牌与 CSS 覆盖。
- 注册的项目路由与导航元数据。
- REST 适配器组装与后端字段映射。
- 编译期受信任的 API/OIDC 源。
- 运行时配置。

通过 `src/project/routes.tsx` 中类型化的 `projectRoutes` 数组添加受保护的应用页面。
每一项提供组件、路由元数据与所需能力；`src/app/routeRegistry.ts` 将这些条目与模板路由合并，
同一份定义驱动路由挂载、权限守卫、登录后跳转与导航元数据。

允许修改模板拥有的文件，但会增加升级冲突风险。边界检查器会在发布前报告反向导入。
