# 测试策略

## 快速检查

- 日常开发先运行 `pnpm test:changed`，只执行与未提交改动相关的 Vitest 用例。
- 公共模块或提交前运行 `pnpm verify`：类型检查、ESLint、dependency-cruiser 架构边界、Knip
  死代码检查、完整 Vitest、生产构建与模板专项校验依次通过。
- Vitest 覆盖运行时配置、偏好解析、响应校验、HTTP 取消、Query 配置、MSW 契约、UI primitive
  组合行为，以及 React Router Data Mode 的认证/能力 middleware、登录重定向、loader 预取、
  Query cache 填充、列表 URL 解析与 `shouldRevalidate` 策略。

## 浏览器检查

- E2E 覆盖本地登录、会话恢复/登出、只读权限、CRUD 与移动端抽屉行为。
- 路由权限用例同时断言未授权请求不会进入业务 loader；OIDC 回调、菜单父 loader 与路由错误边界
  优先由 Vitest 验证纯生命周期逻辑，再由关键浏览器流程验证集成结果。
- 路由 pending 用例用受控请求保持 loader 未完成，断言页头 `aria-busy` 与 live status 在导航结束
  前后正确出现和清理，不使用固定时间等待。
- 登录、用户、角色、菜单四个内置页面均覆盖 light/dark × 1440×900 / 768×1024 / 390×844，
  共 24 张基线；截图前固定主题、等待语义就绪状态并禁用动画。
- Playwright 使用 `fullyParallel` 与 2 workers；E2E 曾以 `--repeat-each=2` 在双 worker 下连续执行
  16 项并全部通过，证明浏览器 Mock 数据、sessionStorage 与测试上下文互相隔离。
- axe-core 按 WCAG 2.0/2.1 A/AA 与 WCAG 2.2 AA 规则检查登录页、已认证外壳与对话框；目标是
  完整 `violations` 数组为空，不按 impact 过滤问题。扫描前等待有限入场动画的 `finished` 状态，
  避免祖先临时 opacity 造成对比度误报。
- 写 E2E 前必须先在真实浏览器走通场景，选择器优先使用 role、label 与可见名称；禁止固定等待。

```bash
pnpm e2e
pnpm visual
pnpm a11y
```

认证测试使用合成用户与一次性值。不持久化 Playwright `storageState`，并禁用
trace/video 采集，避免授权码、令牌与认证 Header 进入 CI 产物。

更新视觉基线前必须先审阅。绝不能仅因 CI 变化就接受基线。
