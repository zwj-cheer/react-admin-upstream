---
name: core-tool-registry
description: 把新增的 core 工具/通用组件登记进本项目的发现体系。用于在 src/core 下新增横切工具函数、hook、领域模块，或在 src/components/common 新增通用组件后，完成 barrel 导出、能力地图回填、必要的 ESLint 护栏，确保后续开发（人或模型）能发现并复用它、而不重复造轮子。
---

# 新增 core 工具的登记流程

本项目靠「发现体系」防止生态膨胀后重复造轮子。任何新增的横切能力**必须登记**，否则下一个
人/模型发现不了它，就会再写一个。登记不是文档义务，是新增工具的**准入条件**。

发现体系有四层，从最有效到兜底：

1. **代码即发现**：barrel 具名导出 + 可预测命名 → 编辑器 auto-import 主动推到面前。
2. **能力地图**：`AGENTS.md`「既有能力地图」表，常驻上下文，动手前先查。
3. **按需 skill**：仅复杂子系统（成套决策/陷阱）才配，单函数工具不配。
4. **ESLint 护栏**：必须走封装的能力，绕开写散装实现时 `no-restricted-*` 直接报错。

## 什么时候触发本流程

- 在 `src/core/<域>` 新增了对外可复用的工具函数、hook、类或领域模块。
- 在 `src/components/common` 新增了通用组件（非页面私有）。
- 把某个原本散落在页面里的逻辑收敛成了统一封装。

页面私有的一次性 helper、`src/components/ui` 的 shadcn 基元不走本流程。

## 登记步骤

### 1. 先查，别重复造

动手前先读 `AGENTS.md`「既有能力地图」。需求已有封装的直接复用；确认没有再新增。

### 2. 域内 barrel 具名导出

- `src/core/<域>/index.ts` 里**具名**导出新符号：`export { foo } from './foo'`。
- **禁止 `export *`**（`vercel-react-best-practices` skill 的 barrel 成本问题）。类型用
  `export type { ... }`。
- 命名可预测、与同域现有风格一致（如 `formatDate`/`formatDateTime` 同前缀），提升补全可发现性。
- 调用方从域 barrel 或具体模块导入（如 `@/core/datetime`），不从跨域集中入口导入。

### 3. 回填能力地图

在 `AGENTS.md`「既有能力地图」表加一行：`需求 | 用这个 | 位置 | 护栏`。一行一能力，
只给指针（符号名 + import 路径），用法留在代码类型签名里，不在表里写用法。

### 4. 需要时加 ESLint 护栏

当「必须走封装、绕开就是错」时（典型：日期格式化、金额精度、请求方式），在
`eslint.config.js` 针对业务目录（`src/modules`/`src/components`/`src/layouts`）加规则：

- 禁直接用底层库：`no-restricted-imports`（如禁业务层直接 `import dayjs`）。
- 禁散装写法：`no-restricted-syntax`（如禁 `Intl.DateTimeFormat`、`toLocaleDateString`）。
- 封装实现自身所在目录要豁免（护栏只拦业务层）。
- 报错 `message` 里写清「请改用 `@/core/<域>` 的哪个封装」。
- 能力地图对应行的「护栏」列标 ✅ 并简述拦了什么。

参考现有样板：`@/core/datetime` 的护栏（`eslint.config.js` 中禁散装日期格式化那段）。

### 5. 判断要不要建独立 skill

- 「用法看签名就懂」的工具函数/组件 → **不建 skill**，第 2、3 步足矣。
- 「有成套决策、陷阱、多步工作流」的子系统 → 才建 skill，并在 `AGENTS.md` skill 列表点名。

### 6. 验证

- `pnpm lint`：确认护栏不误伤既有代码，且能拦住反例（临时写一处违规验证后删除）。
- 改动 `src/core` 属公共模块，按 `AGENTS.md` 跑 `pnpm verify`。
- 若新增了 skill，运行同步脚本补软链（见 `sync-agent-skills` skill）：

  ```bash
  bash .agents/skills/sync-agent-skills/scripts/sync-agent-skills.sh
  ```

## 完成标准

- [ ] 域 barrel 具名导出了新符号，无 `export *`。
- [ ] `AGENTS.md` 能力地图新增对应行。
- [ ] 需要强约束的，ESLint 护栏已加且验证能拦住反例、不误伤既有代码。
- [ ] `pnpm lint` 通过；改动 `src/core` 时 `pnpm verify` 通过。
