# React Admin Upstream

一个干净的单仓库 React 模板，面向像素级还原的管理后台产品。提供 React 启动前的运行时配置、
本地 Cookie 登录、OIDC Code + PKCE、基于能力（capability）的权限控制、可编辑的 Radix 组件、
中英文界面、MSW 开发数据，以及基于 Caddy 的容器镜像。

## 技术栈

- React 19、React Router 8 Data Mode、TypeScript 6、Vite 8、pnpm 10
- TanStack Query 5 / Table 8、Zustand 5、Zod、react-hook-form
- Tailwind 4 令牌映射 + 可编辑的 Radix 组件源码
- Vitest、React Testing Library、Playwright、axe-core、MSW
- Docker 多阶段构建与 Caddy 运行时

## 快速开始

```bash
pnpm install
pnpm dev
```

当 `public/config/runtime.json` 缺失或无效时，开发环境会安全回退到 MSW。

演示账号：

```text
admin@example.com
Admin123!
```

运行质量门禁：

```bash
pnpm verify
pnpm e2e
pnpm visual
pnpm a11y
```

其中 `pnpm verify` 串行执行类型检查、ESLint、dependency-cruiser 架构边界、Knip 死代码检查、
Vitest、生产构建与模板专项校验。

本地 Playwright 使用已安装的 Google Chrome。CI 可省略 `channel` 设置并安装匹配的
Playwright Chromium。

## 运行时配置

版本控制中的 `public/config/runtime.json` 提供默认的本地配置。生产环境必须挂载
`/srv/config/runtime.json`；容器镜像会剔除打包进产物的默认配置文件，因此不携带任何
环境 API 或 IdP 值。

每个字段的说明见[运行时配置文档](docs/architecture/runtime-config.md)。当你在
`public/config/runtime.json` 中增加、删除或修改字段时，必须在同一次改动中同步更新该文档。

认证模式：

- `local`：服务端 Cookie 会话与 CSRF 约定。
- `oidc`：通过 `oidc-client-ts` 的授权码 + PKCE。
- `hybrid`：同时提供两种登录入口；只有当前浏览器会话所选的来源会被恢复。

OIDC 配置绝不包含 Client Secret。应用能力始终来自应用会话适配器，而非不可信的身份声明。

参见[运行时配置](docs/architecture/runtime-config.md)与[部署](docs/architecture/deployment.md)。

## 目录结构

```text
.
├── public/
│   └── config/runtime.json      # 运行时配置（启动前拉取，字段见文档）
├── src/
│   ├── main.tsx                 # 入口，调用 bootstrap
│   ├── bootstrap/               # 模板拥有｜React 挂载前的启动门：拉取校验 runtime.json、
│   │                            #   解析主题/语言、按需启动 MSW、渲染启动错误页
│   ├── core/                    # 模板拥有｜框架核心，禁止导入 src/project/
│   │   ├── config/              #   runtime.json 的 Zod schema 校验与 Provider
│   │   ├── http/                #   HTTP 客户端、CSRF、超时、错误归一化
│   │   ├── auth/                #   本地 Cookie / OIDC / hybrid 认证服务与状态
│   │   ├── permissions/         #   能力授权、<Can> 组件、fail-closed 判定
│   │   ├── services/            #   服务契约与 ServicesProvider / useServices()
│   │   ├── branding/            #   登录页与应用外壳共享的品牌展示模型
│   │   ├── routing/             #   路由注册、授权路由与列表 URL 状态
│   │   ├── theme/               #   主题解析与存储
│   │   └── i18n/                #   中英文文案与语言解析
│   ├── components/              # 模板拥有｜可编辑组件源码
│   │   ├── ui/                  #   按需纳入的 shadcn/Radix 基础组件源码
│   │   └── common/              #   共享业务组件（DataTable、Pagination、ConfirmDialog…）
│   ├── layouts/                 # 模板拥有｜响应式外壳（AppShell、Sidebar、账户菜单、抽屉）
│   ├── modules/                 # 模板拥有｜内置模块：auth / users / roles / menus
│   ├── app/                     # 组装层｜runtime、Data Router、route lifecycle、
│   │                            #   routeRegistry、navigation；认证/能力 middleware
│   │                            #   在业务 loader 前 fail-closed，也是唯一允许注入 project 值的层
│   ├── project/                 # 项目拥有｜下游只改这里：
│   │   ├── branding.ts          #   品牌缩写标记与 edition（显示名称来自 runtime.json 的 app.name）
│   │   ├── navigation.ts        #   导航元数据
│   │   ├── routes.tsx           #   projectRoutes 数组，注册 lazy route module、元数据、能力与可选预取
│   │   ├── services.ts          #   REST 适配器组装
│   │   ├── trustedOrigins.ts    #   编译期受信任的 API/OIDC 源
│   │   └── styles.css           #   样式覆盖
│   ├── adapters/rest/           # REST 适配器：后端字段映射 + Zod 响应校验
│   ├── mocks/                   # MSW 开发数据（mock.enabled 且 DEV 时启用）
│   ├── styles/                  # 全局样式分层（tokens/base/layout/components/responsive）
│   └── test/                    # 测试工具（带 Provider 的 render、setup）
├── tests/                       # Playwright E2E / 视觉 / a11y、部署校验、升级夹具
├── deploy/                      # Caddyfile 与生产运行时配置示例
├── scripts/                     # 模板与容器专项校验脚本
└── docs/                        # 项目文档（全部中文）
```

核心约束：模板目录不能导入 `src/project/`，项目值只能经 `src/app/` 注入；
dependency-cruiser 同时守护无循环、core 领域中立、layout 纯展示、adapter 向内依赖等层级规则，
并通过 `pnpm check:architecture` 接入 `pnpm verify`。

## 项目侧扩展点

下游仓库通常只修改 `src/project/` 下的文件与各自的运行时 JSON。模板拥有 `src/core`、
`src/components`、`src/layouts` 与 `src/modules`。
参见[扩展边界](docs/architecture/extension-boundaries.md)。
本轮按绿地口径完成的取证、决策与迁移路线见
[绿地架构审查与重建路线](docs/architecture/greenfield-architecture-review.md)。

## 容器

```bash
docker build -t react-admin-upstream .
docker run --rm -p 8080:8080 \
  -v "$PWD/deploy/runtime-config.example.json:/srv/config/runtime.json:ro" \
  react-admin-upstream
```

打开 `http://localhost:8080`。

## 上游维护

使用发布标签，而不是持续合并模板主分支。下游项目保留自己的 `origin`，并将本模板添加为
`upstream`。

参见[上游工作流](docs/architecture/upstream-workflow.md)与[升级说明](docs/upgrading/README.md)。
