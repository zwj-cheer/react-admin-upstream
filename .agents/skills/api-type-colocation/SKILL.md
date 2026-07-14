---
name: api-type-colocation
description: 执行本项目的 API 类型组织规范。用于新增、移动、审查或重构 src/adapters/rest 下的 TypeScript 请求类型、响应类型、领域类型，或判断是否应该创建共享 API 类型文件。
---

# API 类型共置

把 TypeScript API 类型放在拥有它们的适配器函数旁边。避免使用兜底式的集中类型文件。

## 规则

1. 与单个后端资源强绑定的请求/响应类型，放在该资源对应的适配器文件里。
2. 类型直接从拥有对应请求函数的适配器模块导出。
3. 调用方从具体适配器模块导入类型，不从集中式类型入口导入。
4. 只有某个类型真正被多个资源共享时，才放入 `src/adapters/rest/schemas.ts`。
5. 纯前端 UI 状态类型放在组件、hook 或 store 附近，不放到 `src/adapters`。
6. 服务契约（跨模板/项目边界的接口）定义在 `src/core/services/contracts.ts`，适配器实现它们。

## 当前映射

```text
src/adapters/rest/authAdapter.ts  # 认证适配器 + 认证专属请求/响应类型
src/adapters/rest/userAdapter.ts  # 用户适配器 + 用户专属类型
src/adapters/rest/roleAdapter.ts  # 角色适配器 + 角色专属类型
src/adapters/rest/menuAdapter.ts  # 菜单适配器 + 菜单专属类型
src/adapters/rest/schemas.ts      # 仅存放真正跨资源共享的 Zod schema 与类型
src/core/services/contracts.ts    # 服务契约（模板拥有，适配器实现）
```

## 导入方式

优先使用具体模块导入：

```ts
import type { UserRecord } from '@/adapters/rest/userAdapter'
```

避免集中式导入。

## 重构检查清单

1. 把每个类型移动到拥有对应后端端点的适配器文件。
2. 把调用方 import 改成具体适配器模块。
3. 搜索旧引用后再删除集中式类型文件。
4. 按 `AGENTS.md` 的验证规则跑 `pnpm verify`。
