---
name: sync-agent-skills
description: 同步本项目多代理入口的 skill 软链接。用于新增、删除或重命名 .agents/skills 下的 skill 后，把 .claude/skills 和 .gemini/skills 同步为指向 .agents/skills 的软链接集合。
---

# 同步代理 Skills

本项目以 `.agents/skills` 作为项目本地 skill 的事实来源，Claude 和 Gemini 只通过软链接读取同一批 skill。新增、删除或重命名 `.agents/skills/*` 后，立即运行同步脚本。

## 使用方式

从仓库根目录运行：

```bash
bash .agents/skills/sync-agent-skills/scripts/sync-agent-skills.sh
```

## 同步目标

脚本会同步这两个目录：

```text
.claude/skills
.gemini/skills
```

## 同步规则

1. 扫描 `.agents/skills/*/SKILL.md`，把每个有效 skill 链接到 `.claude/skills/<skill-name>` 和 `.gemini/skills/<skill-name>`。
2. 链接目标统一使用相对路径 `../../.agents/skills/<skill-name>`。
3. 如果目标目录中已有同名软链接但指向不对，自动修正。
4. 如果目标目录中存在指向 `../../.agents/skills/*` 的失效软链接，自动删除。
5. 如果目标目录中的同名条目是普通文件或普通目录，跳过并打印提示，不覆盖用户内容。

## 验证

同步后检查：

```bash
find .claude/skills .gemini/skills -maxdepth 1 -type l -print
```

新增或修改 skill 后，还要按 `skill-creator` 的要求运行 skill 校验。
